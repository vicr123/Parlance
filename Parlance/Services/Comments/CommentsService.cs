using System.Security.Cryptography;
using System.Text;
using Parlance.CldrData;
using Parlance.Database;
using Parlance.Database.Models;
using Parlance.Vicr123Accounts.Services;

namespace Parlance.Services.Comments;

public class CommentsService : ICommentsService
{
    private readonly IVicr123AccountsService _accountsService;
    private readonly ParlanceContext _databaseContext;

    public CommentsService(IVicr123AccountsService accountsService, ParlanceContext databaseContext)
    {
        _accountsService = accountsService;
        _databaseContext = databaseContext;
    }

    public async Task<object> GetJsonThread(CommentThread thread)
    {
        var headComment = HeadComment(thread);
        return await GetJsonThread(thread, headComment);
    }
    
    public async Task<object> GetJsonThread(CommentThread thread, Comment headComment)
    {
        return new
        {
            thread.Id, thread.Title, thread.IsClosed, thread.IsFlagged, Author = await GetAuthor(headComment.UserId),
            HeadCommentBody = headComment.Text
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