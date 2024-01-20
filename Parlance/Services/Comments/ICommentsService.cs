using Parlance.Database.Models;

namespace Parlance.Services.Comments;

public interface ICommentsService
{
    Task<object> GetJsonThread(CommentThread thread, Comment headComment);
    Task<object> GetAuthor(ulong userId);
}