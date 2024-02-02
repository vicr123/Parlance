using System.Security.Cryptography;
using System.Text.Json;
using Fido2NetLib;
using Microsoft.Extensions.Options;
using Parlance.Vicr123Accounts.DBus;
using Tmds.DBus;
using IFido2 = Parlance.Vicr123Accounts.DBus.IFido2;

namespace Parlance.Vicr123Accounts.Services;

public class Vicr123AccountsService : IVicr123AccountsService
{
    private static readonly Dictionary<int, (string, AssertionOptions)> CachedAssertionOptions = new();
    private readonly IOptions<Vicr123AccountsOptions> _accountOptions;

    private readonly string _applicationName = "Parlance";
    private readonly IOptions<Fido2Options> _fidoOptions;
    private readonly string _serviceName = "com.vicr123.accounts";
    private Connection _connection = null!;
    private IManager _manager = null!;

    public Vicr123AccountsService(IOptions<Vicr123AccountsOptions> accountOptions, IOptions<Fido2Options> fidoOptions)
    {
        _accountOptions = accountOptions;
        _fidoOptions = fidoOptions;
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

    public async Task<string> ForceProvisionTokenAsync(ulong userId)
    {
        return await _manager.ForceProvisionTokenAsync(userId, _applicationName);
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

        return methods.Select(method => (IPasswordResetMethod?)(method.Item1 switch
            {
                "email" => new EmailPasswordResetMethod
                    { Domain = method.Item2["domain"].ToString()!, User = method.Item2["user"].ToString()! },
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

        if (user.Username != await userProxy.GetUsernameAsync()) await userProxy.SetUsernameAsync(user.Username);

        if (user.Email != await userProxy.GetEmailAsync()) await userProxy.SetEmailAsync(user.Email);

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
        catch (DBusException ex) when (ex.ErrorName == "com.vicr123.accounts.Error.VerificationCodeIncorrect")
        {
            return false;
        }
    }

    public async Task UnverifyEmail(User user)
    {
        var objectPath = await _manager.UserByIdAsync(user.Id);
        var userProxy = _connection.CreateProxy<IUser>(_serviceName, objectPath);
        if (!await userProxy.GetVerifiedAsync()) throw new InvalidOperationException();

        await userProxy.SetEmailVerifiedAsync(false);
    }

    public async Task<bool> OtpEnabled(User user)
    {
        var objectPath = await _manager.UserByIdAsync(user.Id);
        var tfProxy = _connection.CreateProxy<ITwoFactor>(_serviceName, objectPath);
        return await tfProxy.GetTwoFactorEnabledAsync();
    }

    public async Task<string> GenerateOtpKey(User user)
    {
        var objectPath = await _manager.UserByIdAsync(user.Id);
        var tfProxy = _connection.CreateProxy<ITwoFactor>(_serviceName, objectPath);
        return await tfProxy.GenerateTwoFactorKeyAsync();
    }

    public async Task EnableOtp(User user, string key)
    {
        var objectPath = await _manager.UserByIdAsync(user.Id);
        var tfProxy = _connection.CreateProxy<ITwoFactor>(_serviceName, objectPath);
        await tfProxy.EnableTwoFactorAuthenticationAsync(key);
    }

    public async Task DisableOtp(User user)
    {
        var objectPath = await _manager.UserByIdAsync(user.Id);
        var tfProxy = _connection.CreateProxy<ITwoFactor>(_serviceName, objectPath);
        await tfProxy.DisableTwoFactorAuthenticationAsync();
    }

    public async Task<IEnumerable<OtpBackupCode>> OtpBackupCodes(User user)
    {
        var objectPath = await _manager.UserByIdAsync(user.Id);
        var tfProxy = _connection.CreateProxy<ITwoFactor>(_serviceName, objectPath);
        return (await tfProxy.GetBackupKeysAsync()).Select(key => new OtpBackupCode
        {
            Code = key.Item1,
            Used = key.Item2
        });
    }

    public async Task RegenerateBackupCodes(User user)
    {
        var objectPath = await _manager.UserByIdAsync(user.Id);
        var tfProxy = _connection.CreateProxy<ITwoFactor>(_serviceName, objectPath);
        await tfProxy.RegenerateBackupKeysAsync();
    }

    public async Task<string> PrepareRegisterFidoKey(User user, int crossPlatformAttachment)
    {
        var objectPath = await _manager.UserByIdAsync(user.Id);
        var fidoProxy = _connection.CreateProxy<IFido2>(_serviceName, objectPath);
        return await fidoProxy.PrepareRegisterAsync(_applicationName, _fidoOptions.Value.ServerDomain,
            crossPlatformAttachment);
    }

    public async Task FinishRegisterFidoKey(User user, JsonElement response, string name)
    {
        var objectPath = await _manager.UserByIdAsync(user.Id);
        var fidoProxy = _connection.CreateProxy<IFido2>(_serviceName, objectPath);
        await fidoProxy.CompleteRegisterAsync(response.GetRawText(), _fidoOptions.Value.Origins.ToArray(), name);
    }

    public async Task<IEnumerable<string>> LoginMethods(string username)
    {
        return await _manager.TokenProvisioningMethodsAsync(username, _applicationName);
    }

    public async Task<IDictionary<string, object>> ProvisionTokenByMethodAsync(string method, string username,
        IDictionary<string, object> parameters)
    {
        return await _manager.ProvisionTokenByMethodAsync(method, username, _applicationName, parameters);
    }

    public async Task<(int, AssertionOptions)> GetFidoAssertionOptions(string username)
    {
        var response = await _manager.ProvisionTokenByMethodAsync("fido", username, _applicationName,
            new Dictionary<string, object>
            {
                { "rpname", _applicationName },
                { "rpid", _fidoOptions.Value.ServerDomain }
            });

        var assertionOptions = JsonSerializer.Deserialize<AssertionOptions>((byte[])response["options"]) ??
                               throw new InvalidOperationException();
        var id = RandomNumberGenerator.GetInt32(int.MaxValue);
        CachedAssertionOptions.Add(id, (username, assertionOptions));

        return (id, assertionOptions);
    }

    public async Task<string> ProvisionTokenViaFido(int id, AuthenticatorAssertionRawResponse response)
    {
        var (username, assertionOptions) = CachedAssertionOptions[id];
        CachedAssertionOptions.Remove(id);

        var dbusResponse = await _manager.ProvisionTokenByMethodAsync("fido", username, _applicationName,
            new Dictionary<string, object>
            {
                { "rpname", _applicationName },
                { "rpid", _fidoOptions.Value.ServerDomain },
                { "pregetOptions", JsonSerializer.SerializeToUtf8Bytes(assertionOptions) },
                { "response", JsonSerializer.SerializeToUtf8Bytes(response) },
                {
                    "extraOrigins", _fidoOptions.Value.Origins.ToArray()
                }
            });

        return dbusResponse["token"].ToString()!;
    }

    public async Task<IEnumerable<FidoKey>> GetFidoKeys(User user)
    {
        var objectPath = await _manager.UserByIdAsync(user.Id);
        var fidoProxy = _connection.CreateProxy<IFido2>(_serviceName, objectPath);
        var keys = await fidoProxy.GetKeysAsync();
        return keys.Select(tuple =>
        {
            var (id, application, name) = tuple;
            return new FidoKey
            {
                Id = id,
                Application = application,
                Name = name
            };
        });
    }

    public async Task DeleteFidoKey(User user, int id)
    {
        var objectPath = await _manager.UserByIdAsync(user.Id);
        var fidoProxy = _connection.CreateProxy<IFido2>(_serviceName, objectPath);
        await fidoProxy.DeleteKeyAsync(id);
    }

    public async Task SendEmail(User user, (string Address, string Name) from, string subject, string textContent, string htmlContent)
    {
        var objectPath = await _manager.UserByIdAsync(user.Id);
        var userProxy = _connection.CreateProxy<IUser>(_serviceName, objectPath);
        if (!await userProxy.GetVerifiedAsync()) return; // Don't send email to users that are not verified

        var mailMessageObjectPath = await userProxy.CreateMailMessageAsync();
        var mailMessageProxy = _connection.CreateProxy<IMailMessage>(_serviceName, mailMessageObjectPath);

        await Task.WhenAll(
            mailMessageProxy.SetFromAsync(from),
            mailMessageProxy.SetSubjectAsync(subject),
            mailMessageProxy.SetHtmlContentAsync(htmlContent),
            mailMessageProxy.SetTextContentAsync(textContent)
        );
        
        await mailMessageProxy.SendAsync();
    }

    private async Task InitAsync()
    {
        _connection = new Connection(new ClientConnectionOptions(_accountOptions.Value.DbusConnectionPath)
        {
            AutoConnect = true
        });
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