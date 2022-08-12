using Microsoft.AspNet.Identity;
using Parlance.Vicr123Accounts.Services;

namespace Parlance.Vicr123Accounts.Identity;

public class Vicr123AccountsUserStore : IUserStore<Vicr123AccountsUser, ulong>,
    IUserTwoFactorStore<Vicr123AccountsUser, ulong>
{
    private readonly IVicr123AccountsService _accountsService;

    public Vicr123AccountsUserStore(IVicr123AccountsService accountsService)
    {
        _accountsService = accountsService;
    }

    public void Dispose()
    {
    }

    public async Task CreateAsync(Vicr123AccountsUser user)
    {
    }

    public Task UpdateAsync(Vicr123AccountsUser user)
    {
        throw new NotImplementedException();
    }

    public Task DeleteAsync(Vicr123AccountsUser user)
    {
        throw new NotImplementedException();
    }

    public async Task<Vicr123AccountsUser> FindByIdAsync(ulong userId)
    {
        return new Vicr123AccountsUser(await _accountsService.UserById(userId));
    }

    public async Task<Vicr123AccountsUser> FindByNameAsync(string userName)
    {
        return new Vicr123AccountsUser(await _accountsService.UserByUsername(userName));
    }

    public Task SetTwoFactorEnabledAsync(Vicr123AccountsUser user, bool enabled)
    {
        throw new NotImplementedException();
    }

    public Task<bool> GetTwoFactorEnabledAsync(Vicr123AccountsUser user)
    {
        throw new NotImplementedException();
    }
}