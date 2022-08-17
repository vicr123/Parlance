using accounts.DBus;
using Microsoft.Extensions.Options;
using Tmds.DBus;

namespace Parlance.Vicr123Accounts.Services;

public class Vicr123AccountsService : IVicr123AccountsService
{
    private readonly IOptions<Vicr123AccountsOptions> _accountOptions;
    private readonly string _applicationName = "Parlance";

    private readonly string _serviceName = "com.vicr123.accounts";
    private Connection _connection = null!;
    private IManager _manager = null!;

    public Vicr123AccountsService(IOptions<Vicr123AccountsOptions> accountOptions)
    {
        _accountOptions = accountOptions;
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
            .Where(prMethod => prMethod is not null)!;
    }

    public async Task PerformPasswordReset(User user, string type, IDictionary<string, object> challenge)
    {
        var objectPath = await _manager.UserByIdAsync(user.Id);
        var passwordResetProxy = _connection.CreateProxy<IPasswordReset>(_serviceName, objectPath);
        await passwordResetProxy.ResetPasswordAsync(type, challenge);
    }

    public async Task<bool> VerifyUserPassword(User user, string password)
    {
        var objectPath = await _manager.UserByIdAsync(user.Id);
        var userProxy = _connection.CreateProxy<IUser>(_serviceName, objectPath);
        return await userProxy.VerifyPasswordAsync(password);
    }

    public async Task<User> UpdateUser(User user)
    {
        var objectPath = await _manager.UserByIdAsync(user.Id);
        var userProxy = _connection.CreateProxy<IUser>(_serviceName, objectPath);
        
        if (user.Username != await userProxy.GetUsernameAsync())
        {
            await userProxy.SetUsernameAsync(user.Username);
        }

        if (user.Email != await userProxy.GetEmailAsync())
        {
            await userProxy.SetEmailAsync(user.Email);
        }

        return await UserByObjectPath(objectPath);
    }

    public async Task UpdateUserPassword(User user, string newPassword)
    {
        var objectPath = await _manager.UserByIdAsync(user.Id);
        var userProxy = _connection.CreateProxy<IUser>(_serviceName, objectPath);
        await userProxy.SetPasswordAsync(newPassword);
    }

    public async Task ResendVerificationEmail(User user)
    {
        var objectPath = await _manager.UserByIdAsync(user.Id);
        var userProxy = _connection.CreateProxy<IUser>(_serviceName, objectPath);
        if (await userProxy.GetVerifiedAsync()) throw new InvalidOperationException();
        
        await userProxy.ResendVerificationEmailAsync();
    }

    public async Task<bool> VerifyEmail(User user, string verificationCode)
    {
        var objectPath = await _manager.UserByIdAsync(user.Id);
        var userProxy = _connection.CreateProxy<IUser>(_serviceName, objectPath);
        if (await userProxy.GetVerifiedAsync()) throw new InvalidOperationException();

        try
        {
            await userProxy.VerifyEmailAsync(verificationCode);
            return true;
        }
        catch (DBusException ex)
        {
            if (ex.ErrorName == "com.vicr123.accounts.Error.VerificationCodeIncorrect") return false;
            throw;
        }
    }

    private async Task InitAsync()
    {
        _connection = new Connection(_accountOptions.Value.DbusConnectionPath);
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
            Email = await userProxy.GetEmailAsync(),
            EmailVerified = await userProxy.GetVerifiedAsync()
        };
    }
}