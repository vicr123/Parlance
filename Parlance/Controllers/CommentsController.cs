using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Parlance.CldrData;
using Parlance.Database;
using Parlance.Database.Models;
using Parlance.Project;
using Parlance.Project.Index;
using Parlance.Services.Projects;
using Parlance.Vicr123Accounts.Authentication;
using Parlance.Vicr123Accounts.Services;

namespace Parlance.Controllers;

[ApiController]
[Route("api/[controller]")]
[EnableRateLimiting("limiter")]
public class CommentsController : Controller
{
    private readonly IVicr123AccountsService _accountsService;
    private readonly ParlanceContext _databaseContext;
    private readonly IParlanceIndexingService _indexingService;
    private readonly IProjectService _projectService;

    public CommentsController(ParlanceContext databaseContext, IProjectService projectService,
        IParlanceIndexingService indexingService, IVicr123AccountsService accountsService)
    {
        _databaseContext = databaseContext;
        _projectService = projectService;
        _indexingService = indexingService;
        _accountsService = accountsService;
    }

    [HttpGet]
    [Route("{project}/{subproject}/{language}/{key}")]
    public async Task<IActionResult> GetCommentThreads(string project, string subproject, string language,
        string key)
    {
        var p = await _projectService.ProjectBySystemName(project);
        var subprojectLanguage = p.GetParlanceProject().SubprojectBySystemName(subproject)
            .Language(language.ToLocale());
        await using var translationFile = await subprojectLanguage.CreateTranslationFile(_indexingService);
        if (translationFile is null)
        {
            return NotFound();
        }

        if (translationFile.Entries.All(x => x.Key != key))
        {
            return NotFound();
        }

        return Json(_databaseContext.CommentThreads.Where(x =>
            x.Project == project && x.Subproject == subproject &&
            x.Language == language.ToLocale().ToDatabaseRepresentation() && x.Key == key).Select(x => new
        {
            x.Id, x.Title
        }));
    }

    [HttpPost]
    [Route("{project}/{subproject}/{language}/{key}")]
    [Authorize(Policy = "LanguageEditor")]
    public async Task<IActionResult> CreateNewCommentThread(string project, string subproject, string language,
        string key,
        [FromBody] CreateNewCommentThreadRequestData data)
    {
        var p = await _projectService.ProjectBySystemName(project);
        var subprojectLanguage = p.GetParlanceProject().SubprojectBySystemName(subproject)
            .Language(language.ToLocale());
        await using var translationFile = await subprojectLanguage.CreateTranslationFile(_indexingService);
        if (translationFile is null)
        {
            return NotFound();
        }

        if (translationFile.Entries.All(x => x.Key != key))
        {
            return NotFound();
        }

        var userId = ulong.Parse(HttpContext.User.Claims.First(claim => claim.Type == Claims.UserId).Value);

        var thread = new CommentThread
        {
            Project = project,
            Subproject = subproject,
            Language = language.ToLocale().ToDatabaseRepresentation(),
            Title = data.Title,
            Key = key,
            IsFlagged = false,
            IsClosed = false
        };
        _databaseContext.CommentThreads.Add(thread);

        _databaseContext.Comments.Add(new()
        {
            Thread = thread,
            Text = data.Body,
            Date = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
            UserId = userId
        });
        _databaseContext.CommentThreadSubscriptions.Add(new()
        {
            Thread = thread,
            UserId = userId
        });

        await _databaseContext.SaveChangesAsync();

        return Json(new
        {
            thread.Id, thread.Title
        });
    }

    [HttpGet]
    [Route("{id:guid}")]
    public async Task<IActionResult> GetCommentsInThread(Guid id)
    {
        var comments = new List<object>();
        var dbComments = _databaseContext.Comments.Where(x => x.ThreadId == id)
            .OrderBy(x => x.Date);
        if (!dbComments.Any())
        {
            return NotFound();
        }

        foreach (var comment in dbComments)
        {
            comments.Add(new
            {
                comment.Text, comment.Date, Author = await GetAuthor(comment.UserId)
            });
        }

        return Json(comments);
    }

    [HttpPost]
    [Route("{threadId:guid}")]
    [Authorize(Policy = "LanguageEditor")]
    public async Task<IActionResult> ReplyToThread(Guid threadId, [FromBody] ReplyToThreadRequestData data)
    {
        try
        {
            var userId = ulong.Parse(HttpContext.User.Claims.First(claim => claim.Type == Claims.UserId).Value);

            _databaseContext.Comments.Add(new()
            {
                Thread = _databaseContext.CommentThreads.Single(x => x.Id == threadId),
                Text = data.Body,
                Date = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
                UserId = userId
            });

            await _databaseContext.SaveChangesAsync();

            return await GetCommentsInThread(threadId);
        }
        catch (InvalidOperationException)
        {
            return NotFound();
        }
    }

    private async Task<object> GetAuthor(ulong userId)
    {
        var user = await _accountsService.UserById(userId);
        return new
        {
            user.Username,
            Picture =
                $"https://www.gravatar.com/avatar/{Convert.ToHexString(MD5.HashData(new UTF8Encoding(false).GetBytes(user.Email.Trim().ToLower()))).ToLower()}"
        };
    }

    public class CreateNewCommentThreadRequestData
    {
        public string Title { get; set; } = null!;
        public string Body { get; set; } = null!;
    }

    public class ReplyToThreadRequestData
    {
        public string Body { get; set; } = null!;
    }
}