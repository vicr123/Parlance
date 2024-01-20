using System.Security.Cryptography;
using System.Text;
using Parlance.Database.Models;
using Parlance.Vicr123Accounts.Services;

namespace Parlance.Services.Comments;

public class CommentsService : ICommentsService
{
    private readonly IVicr123AccountsService _accountsService;

    public CommentsService(IVicr123AccountsService accountsService)
    {
        _accountsService = accountsService;
    }
    
    public async Task<object> GetJsonThread(CommentThread thread, Comment headComment)
    {
        return new
        {
            thread.Id, thread.Title, thread.IsClosed, thread.IsFlagged, Author = await GetAuthor(headComment.UserId),
            HeadCommentBody = headComment.Text
        };
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
}