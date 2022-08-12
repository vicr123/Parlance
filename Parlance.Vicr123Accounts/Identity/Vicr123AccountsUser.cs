using Microsoft.AspNet.Identity;
using Parlance.Vicr123Accounts.Services;

namespace Parlance.Vicr123Accounts.Identity;

public class Vicr123AccountsUser : IUser<ulong>
{
    private readonly User _user;

    public Vicr123AccountsUser(User user)
    {
        _user = user;
    }

    public ulong Id => _user.Id;

    public string UserName
    {
        get => _user.Username;
        set => _user.Username = value;
    }
}