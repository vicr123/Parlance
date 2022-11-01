using System.Runtime.CompilerServices;
using Tmds.DBus;

[assembly: InternalsVisibleTo(Connection.DynamicAssemblyName)]

namespace Parlance.Vicr123Accounts.DBus;

[DBusInterface("com.vicr123.accounts.Manager")]
internal interface IManager : IDBusObject
{
    Task<ObjectPath> CreateUserAsync(string Username, string Password, string Email);
    Task<ObjectPath> UserByIdAsync(ulong Id);
    Task<ulong> UserIdByUsernameAsync(string Username);

    Task<string> ProvisionTokenAsync(string Username, string Password, string Application,
        IDictionary<string, object> ExtraOptions);

    Task<string> ForceProvisionTokenAsync(ulong UserId, string Application);
    Task<string[]> TokenProvisioningMethodsAsync(string Username, string Application);

    Task<IDictionary<string, object>> ProvisionTokenByMethodAsync(string Method, string Username, string Application,
        IDictionary<string, object> ExtraOptions);

    Task<ObjectPath> UserForTokenAsync(string Token);
    Task<ulong[]> AllUsersAsync();
}

[DBusInterface("com.vicr123.accounts.Fido2")]
internal interface IFido2 : IDBusObject
{
    Task<string> PrepareRegisterAsync(string Application, string Rp, int AuthenticatorAttachment);
    Task CompleteRegisterAsync(string Response, string[] ExpectOrigins, string KeyName);
    Task<(int, string, string)[]> GetKeysAsync();
    Task DeleteKeyAsync(int Id);
}

[DBusInterface("com.vicr123.accounts.PasswordReset")]
internal interface IPasswordReset : IDBusObject
{
    Task<(string, IDictionary<string, object>)[]> ResetMethodsAsync();
    Task ResetPasswordAsync(string Type, IDictionary<string, object> Challenge);
}

[DBusInterface("com.vicr123.accounts.TwoFactor")]
internal interface ITwoFactor : IDBusObject
{
    Task<string> GenerateTwoFactorKeyAsync();
    Task EnableTwoFactorAuthenticationAsync(string OtpKey);
    Task DisableTwoFactorAuthenticationAsync();
    Task RegenerateBackupKeysAsync();
    Task<IDisposable> WatchTwoFactorEnabledChangedAsync(Action<bool> handler, Action<Exception> onError = null);
    Task<IDisposable> WatchSecretKeyChangedAsync(Action<string> handler, Action<Exception> onError = null);
    Task<IDisposable> WatchBackupKeysChangedAsync(Action<(string, bool)[]> handler, Action<Exception> onError = null);
    Task<T> GetAsync<T>(string prop);
    Task<TwoFactorProperties> GetAllAsync();
    Task SetAsync(string prop, object val);
    Task<IDisposable> WatchPropertiesAsync(Action<PropertyChanges> handler);
}

[Dictionary]
internal class TwoFactorProperties
{
    public bool TwoFactorEnabled { get; set; } = default;

    public string SecretKey { get; set; } = default;

    public (string, bool)[] BackupKeys { get; set; } = default;
}

internal static class TwoFactorExtensions
{
    public static Task<bool> GetTwoFactorEnabledAsync(this ITwoFactor o)
    {
        return o.GetAsync<bool>("TwoFactorEnabled");
    }

    public static Task<string> GetSecretKeyAsync(this ITwoFactor o)
    {
        return o.GetAsync<string>("SecretKey");
    }

    public static Task<(string, bool)[]> GetBackupKeysAsync(this ITwoFactor o)
    {
        return o.GetAsync<(string, bool)[]>("BackupKeys");
    }
}

[DBusInterface("com.vicr123.accounts.User")]
internal interface IUser : IDBusObject
{
    Task SetUsernameAsync(string Username);
    Task SetPasswordAsync(string Password);
    Task SetEmailAsync(string Email);
    Task ResendVerificationEmailAsync();
    Task VerifyEmailAsync(string VerificationCode);
    Task<bool> VerifyPasswordAsync(string Password);
    Task ErasePasswordAsync();
    Task SetEmailVerifiedAsync(bool Verified);

    Task<IDisposable> WatchUsernameChangedAsync(Action<(string oldUsername, string newUsername)> handler,
        Action<Exception> onError = null);

    Task<IDisposable> WatchEmailChangedAsync(Action<string> handler, Action<Exception> onError = null);
    Task<IDisposable> WatchVerifiedChangedAsync(Action<bool> handler, Action<Exception> onError = null);
    Task<T> GetAsync<T>(string prop);
    Task<UserProperties> GetAllAsync();
    Task SetAsync(string prop, object val);
    Task<IDisposable> WatchPropertiesAsync(Action<PropertyChanges> handler);
}

[Dictionary]
internal class UserProperties
{
    public ulong Id { get; set; } = default;

    public string Username { get; set; } = default;

    public string Email { get; set; } = default;

    public bool Verified { get; set; } = default;
}

internal static class UserExtensions
{
    public static Task<ulong> GetIdAsync(this IUser o)
    {
        return o.GetAsync<ulong>("Id");
    }

    public static Task<string> GetUsernameAsync(this IUser o)
    {
        return o.GetAsync<string>("Username");
    }

    public static Task<string> GetEmailAsync(this IUser o)
    {
        return o.GetAsync<string>("Email");
    }

    public static Task<bool> GetVerifiedAsync(this IUser o)
    {
        return o.GetAsync<bool>("Verified");
    }
}