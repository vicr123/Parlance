using accounts.DBus;
using Tmds.DBus;

namespace Parlance.Vicr123Accounts.Services;

public class Vicr123AccountsService : IVicr123AccountsService
{
    private Connection _connection;
    private IManager _manager;
    public Vicr123AccountsService()
    {
        InitAsync().Wait();
    }

    public async Task InitAsync()
    {
        _connection = new Connection("unix:path=/var/vicr123-accounts/vicr123-accounts-bus");
        await _connection.ConnectAsync();

        _manager = _connection.CreateProxy<IManager>("com.vicr123.accounts", "/com/vicr123/accounts");
    }
}