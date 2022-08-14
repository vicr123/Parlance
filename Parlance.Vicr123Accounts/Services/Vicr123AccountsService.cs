using accounts.DBus;
using Tmds.DBus;

namespace Parlance.Vicr123Accounts.Services;

public class Vicr123AccountsService : IVicr123AccountsService
{
    private readonly string _applicationName = "Parlance";

    private readonly string _serviceName = "com.vicr123.accounts";
    private Connection _connection;
    private IManager _manager;

    public Vicr123AccountsService()
    {
        InitAsync().Wait();
    }

    public async Task<string> ProvisionTokenAsync(ProvisionTokenParameters parameters)
    {
        var extraOptions = new Dictionary<string, object>();
        if (parameters.OtpToken is not null) extraOptions.Add("otpToken", parameters.OtpToken);

        if (parameters.NewPassword is not null) extraOptions.Add("newPassword", parameters.NewPassword);

        return await _manager.ProvisionTokenAsync(parameters.Username, parameters.Password, _applicationName,
            extraOptions);
    }

    public async Task<User> UserByToken(string token)
    {
        var objectPath = await _manager.UserForTokenAsync(token);
        return await UserByObjectPath(objectPath);
    }

    public async Task<User> UserById(ulong id)
    {
        var objectPath = await _manager.UserByIdAsync(id);
        return await UserByObjectPath(objectPath);
    }

    public async Task<User> UserByUsername(string username)
    {
        var id = await _manager.UserIdByUsernameAsync(username);
        return await UserById(id);
    }

    public async Task<User> CreateUser(string username, string password, string email)
    {
        var objectPath = await _manager.CreateUserAsync(username, password, email);
        return await UserByObjectPath(objectPath);
    }

    public async Task<IEnumerable<IPasswordResetMethod>> PasswordResetMethods(User user)
    {
        var objectPath = await _manager.UserByIdAsync(user.Id);
        var passwordResetProxy = _connection.CreateProxy<IPasswordReset>(_serviceName, objectPath);
        var methods = await passwordResetProxy.ResetMethodsAsync();

        return methods.Select(method => (IPasswordResetMethod?) (method.Item1 switch
            {
                "email" => new EmailPasswordResetMethod() { Domain = method.Item2["domain"].ToString()!, User = method.Item2["user"].ToString()! },
                _ => null
            }))
            .Where(prMethod => prMethod is not null)
            .ToList()!;
    }

    public async Task PerformPasswordReset(User user, string type, IDictionary<string, object> challenge)
    {
        var objectPath = await _manager.UserByIdAsync(user.Id);
        var passwordResetProxy = _connection.CreateProxy<IPasswordReset>(_serviceName, objectPath);
        await passwordResetProxy.ResetPasswordAsync(type, challenge);
    }

    public async Task InitAsync()
    {
        _connection = new Connection("unix:path=/var/vicr123-accounts/vicr123-accounts-bus");
        await _connection.ConnectAsync();

        _manager = _connection.CreateProxy<IManager>(_serviceName, "/com/vicr123/accounts");
    }

    private async Task<User> UserByObjectPath(ObjectPath objectPath)
    {
        var userProxy = _connection.CreateProxy<IUser>(_serviceName, objectPath);
        return new User
        {
            Id = await userProxy.GetIdAsync(),
            Username = await userProxy.GetUsernameAsync(),
            Email = await userProxy.GetEmailAsync()
        };
    }
}