using System.Security.Cryptography;
using System.Text;
using Parlance.CldrData;
using Parlance.Database;
using Parlance.Database.Models;
using Parlance.Project;
using Parlance.Project.Index;
using Parlance.Services.Projects;
using Parlance.Vicr123Accounts.Services;

namespace Parlance.Services.Comments;

public class CommentsService : ICommentsService
{
    private readonly IVicr123AccountsService _accountsService;
    private readonly ParlanceContext _databaseContext;
    private readonly IProjectService _projectService;
    private readonly IParlanceIndexingService _indexingService;

    public CommentsService(IVicr123AccountsService accountsService, ParlanceContext databaseContext, IProjectService projectService, IParlanceIndexingService indexingService)
    {
        _accountsService = accountsService;
        _databaseContext = databaseContext;
        _projectService = projectService;
        _indexingService = indexingService;
    }

    public async Task<object> GetJsonThread(CommentThread thread)
    {
        var headComment = HeadComment(thread);
        return await GetJsonThread(thread, headComment);
    }
    
    public async Task<object> GetJsonThread(CommentThread thread, Comment headComment)
    {
        var language = Locale.FromDatabaseRepresentation(thread.Language)!;
        
        var p = await _projectService.ProjectBySystemName(thread.Project);
        var subprojectLanguage = p.GetParlanceProject().SubprojectBySystemName(thread.Subproject)
            .Language(language);
        await using var translationFile = await subprojectLanguage.CreateTranslationFile(_indexingService);

        var entry = translationFile?.Entries.FirstOrDefault(x => x.Key == thread.Key);
        
        return new
        {
            thread.Id, thread.Title, thread.IsClosed, thread.IsFlagged, thread.Project, thread.Subproject,
            Language = language.ToDashed(), thread.Key, Author = await GetAuthor(headComment.UserId),
            HeadCommentBody = headComment.Text,
            SourceTranslation = entry?.Source
        };
    }

    public async Task<object> GetJsonThreads(IEnumerable<CommentThread> threads)
    {
        var result = new List<object>();
        foreach (var thread in threads)
        {
            result.Add(await GetJsonThread(thread));
        }

        return result;
    }

    public async Task<object> GetAuthor(ulong userId)
    {
        var user = await _accountsService.UserById(userId);
        return new
        {
            user.Username,
            Picture =
                $"https://www.gravatar.com/avatar/{Convert.ToHexString(MD5.HashData(new UTF8Encoding(false).GetBytes(user.Email.Trim().ToLower()))).ToLower()}"
        };
    }

    public IEnumerable<CommentThread> Threads(string project = "", string subproject = "", Locale? language = null, string key = "", bool openOnly = false)
    {
        IQueryable<CommentThread> query = _databaseContext.CommentThreads;

        if (!string.IsNullOrEmpty(project))
            query = query.Where(thread => thread.Project == project);

        if (!string.IsNullOrEmpty(subproject))
            query = query.Where(thread => thread.Subproject == subproject);

        if (language is not null)
            query = query.Where(thread => thread.Language == language.ToDatabaseRepresentation());

        if (!string.IsNullOrEmpty(key))
            query = query.Where(thread => thread.Key == key);

        if (openOnly)
            query = query.Where(thread => !thread.IsClosed);

        return query;
    }

    public Comment HeadComment(CommentThread thread)
    {
        return _databaseContext.Comments.Where(c => c.ThreadId == thread.Id && c.Event == null).OrderBy(c => c.Date).Last();
    }
}