using Parlance.CldrData;
using Parlance.Database.Models;

namespace Parlance.Services.Comments;

public interface ICommentsService
{
    Task<object> GetJsonThread(CommentThread thread, Comment headComment);
    Task<object> GetAuthor(ulong userId);
    Comment HeadComment(CommentThread thread);
    IEnumerable<CommentThread> Threads(string project = "", string subproject = "", Locale? language = null, string key = "", bool openOnly = false);
    Task<object> GetJsonThread(CommentThread thread);
    Task<object> GetJsonThreads(IEnumerable<CommentThread> threads);
}