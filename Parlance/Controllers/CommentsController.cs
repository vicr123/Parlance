using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Parlance.CldrData;
using Parlance.Database;
using Parlance.Database.Models;
using Parlance.Helpers;
using Parlance.Project;
using Parlance.Project.Index;
using Parlance.Services.Comments;
using Parlance.Services.Projects;
using Parlance.Vicr123Accounts.Authentication;

namespace Parlance.Controllers;

[ApiController]
[Route("api/[controller]")]
[EnableRateLimiting("limiter")]
public class CommentsController : Controller
{
    private readonly ICommentsService _commentsService;
    private readonly ParlanceContext _databaseContext;
    private readonly IParlanceIndexingService _indexingService;
    private readonly IProjectService _projectService;

    public CommentsController(ParlanceContext databaseContext, IProjectService projectService,
        IParlanceIndexingService indexingService, ICommentsService commentsService)
    {
        _databaseContext = databaseContext;
        _projectService = projectService;
        _indexingService = indexingService;
        _commentsService = commentsService;
    }

    [HttpGet]
    [Route("{project}/{subproject}/{language}")]
    public async Task<IActionResult> GetCommentThreads(string project, string subproject, string language)
    {
        var p = await _projectService.ProjectBySystemName(project);
        var subprojectLanguage = p.GetParlanceProject().SubprojectBySystemName(subproject)
            .Language(language.ToLocale());
        await using var translationFile = await subprojectLanguage.CreateTranslationFile(_indexingService);
        if (translationFile is null)
        {
            return NotFound();
        }

        var threads = _commentsService.Threads(project, subproject, language.ToLocale(), openOnly: true);

        return Json(await _commentsService.GetJsonThreads(threads));
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

        var threads = _commentsService.Threads(project, subproject, language.ToLocale(), key);

        return Json(await _commentsService.GetJsonThreads(threads));
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

        if (string.IsNullOrWhiteSpace(data.Title) || string.IsNullOrWhiteSpace(data.Body))
        {
            return this.ClientError(ParlanceClientError.IncorrectParameters);
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

        var headComment = new Comment
        {
            Thread = thread,
            Text = data.Body,
            Date = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
            UserId = userId
        };

        _databaseContext.Comments.Add(headComment);
        _databaseContext.CommentThreadSubscriptions.Add(new()
        {
            Thread = thread,
            UserId = userId
        });

        await _databaseContext.SaveChangesAsync();

        return Json(await _commentsService.GetJsonThread(thread, headComment));
    }

    [HttpGet]
    [Route("{id:guid}")]
    public async Task<IActionResult> GetCommentsInThread(Guid id)
    {
        var comments = await CommentsInThread(id);
        if (comments is null)
        {
            return NotFound();
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

            if (string.IsNullOrWhiteSpace(data.Body))
            {
                return this.ClientError(ParlanceClientError.IncorrectParameters);
            }

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

    [HttpPost]
    [Route("{threadId:guid}/close")]
    [Authorize(Policy = "LanguageEditor")]
    public async Task<IActionResult> CloseThread(Guid threadId)
    {
        try
        {
            var userId = ulong.Parse(HttpContext.User.Claims.First(claim => claim.Type == Claims.UserId).Value);

            var thread = _databaseContext.CommentThreads.Single(x => x.Id == threadId);
            if (thread.IsClosed)
            {
                return StatusCode(StatusCodes.Status405MethodNotAllowed);
            }

            thread.IsClosed = true;
            _databaseContext.Update(thread);

            _databaseContext.Comments.Add(new()
            {
                Thread = thread,
                Text = "Closed Thread",
                Date = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
                UserId = userId,
                Event = "closed"
            });

            await _databaseContext.SaveChangesAsync();

            var headComment = _databaseContext.Comments.Where(c => c.ThreadId == thread.Id && c.Event == null).OrderBy(c => c.Date)
                .Last();

            return Json(new
            {
                Thread = await _commentsService.GetJsonThread(thread, headComment),
                Comments = await CommentsInThread(threadId)
            });
        }
        catch (InvalidOperationException)
        {
            return NotFound();
        }
    }

    [HttpDelete]
    [Route("{threadId:guid}/close")]
    [Authorize(Policy = "LanguageEditor")]
    public async Task<IActionResult> ReopenThread(Guid threadId)
    {
        try
        {
            var userId = ulong.Parse(HttpContext.User.Claims.First(claim => claim.Type == Claims.UserId).Value);

            var thread = _databaseContext.CommentThreads.Single(x => x.Id == threadId);
            if (!thread.IsClosed)
            {
                return StatusCode(StatusCodes.Status405MethodNotAllowed);
            }

            thread.IsClosed = false;
            _databaseContext.Update(thread);

            _databaseContext.Comments.Add(new()
            {
                Thread = thread,
                Text = "Reopened Thread",
                Date = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
                UserId = userId,
                Event = "reopened"
            });

            await _databaseContext.SaveChangesAsync();

            var headComment = _databaseContext.Comments.Where(c => c.ThreadId == thread.Id && c.Event == null).OrderBy(c => c.Date)
                .Last();

            return Json(new
            {
                Thread = await _commentsService.GetJsonThread(thread, headComment),
                Comments = await CommentsInThread(threadId)
            });
        }
        catch (InvalidOperationException)
        {
            return NotFound();
        }
    }

    private async Task<IEnumerable<object>?> CommentsInThread(Guid threadId)
    {
        var comments = new List<object>();
        var dbComments = _databaseContext.Comments.Where(x => x.ThreadId == threadId)
            .OrderBy(x => x.Date);
        if (!dbComments.Any())
        {
            return null;
        }

        foreach (var comment in dbComments)
        {
            comments.Add(new
            {
                comment.Text, comment.Date, Author = await _commentsService.GetAuthor(comment.UserId), comment.Event
            });
        }

        return comments;
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