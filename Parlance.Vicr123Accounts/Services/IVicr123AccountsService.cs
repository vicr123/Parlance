using System.Text.Json;
using Fido2NetLib;

namespace Parlance.Vicr123Accounts.Services;

public class ProvisionTokenParameters
{
    public required string Purpose { get; init; }
    public required string Username { get; init; }
    public required string Password { get; init; }
    public string? OtpToken { get; init; }
    public string? NewPassword { get; init; }
}

public class User
{
    public ulong Id { get; set; }
    public string Username { get; set; } = null!;
    public string Email { get; set; } = null!;

    public bool EmailVerified { get; init; }
    //Don't include the object path in here because the accounts daemon can kill the object at any time
}

public interface IPasswordResetMethod
{
    public object ToJsonSerializable();
}

public class EmailPasswordResetMethod : IPasswordResetMethod
{
    public string Domain { get; init; } = null!;
    public string User { get; init; } = null!;

    public object ToJsonSerializable()
    {
        return new
        {
            Type = "email",
            Domain,
            User
        };
    }
}

public class OtpBackupCode
{
    public string Code { get; init; } = null!;
    public bool Used { get; init; }
}

public class FidoKey
{
    public int Id { get; init; }
    public string Application { get; init; } = null!;
    public string Name { get; init; } = null!;
}

public interface IVicr123AccountsService
{
    public const int CrossPlatformAttachmentPlatform = 0;
    public const int CrossPlatformAttachmentCrossPlatform = 1;
    public const int CrossPlatformAttachmentAny = 2;
    
    public Task<string> ProvisionTokenAsync(ProvisionTokenParameters parameters);
    public Task<string> ForceProvisionTokenAsync(ulong userId);
    public Task<User> UserByToken(string token);
    public Task<User> UserById(ulong id);
    public Task<User> UserByUsername(string username);
    public Task<User> CreateUser(string username, string password, string email);
    public Task<IEnumerable<IPasswordResetMethod>> PasswordResetMethods(User user);
    public Task PerformPasswordReset(User user, string type, IDictionary<string, object> challenge);
    public Task<bool> VerifyAccountModificationToken(User user, string token);
    public Task<User> UpdateUser(User user);
    public Task UpdateUserPassword(User user, string newPassword);
    public Task ResendVerificationEmail(User user);
    public Task<bool> VerifyEmail(User user, string verificationCode);
    public Task<bool> OtpEnabled(User user);
    public Task<string> GenerateOtpKey(User user);
    public Task EnableOtp(User user, string key);
    public Task DisableOtp(User user);
    public Task<IEnumerable<OtpBackupCode>> OtpBackupCodes(User user);
    public Task RegenerateBackupCodes(User user);

    public Task<string> PrepareRegisterFidoKey(User user, int crossPlatformAttachment);
    public Task FinishRegisterFidoKey(User user, JsonElement response, string name);
    public Task<IEnumerable<string>> LoginMethods(string username, string purpose);

    public Task<IDictionary<string, object>> ProvisionTokenByMethodAsync(string method, string username,
        IDictionary<string, object> parameters);

    public Task<(int, AssertionOptions)> GetFidoAssertionOptions(string username);
    public Task<string> ProvisionTokenViaFido(int id, string purpose, AuthenticatorAssertionRawResponse response);
    public Task<IEnumerable<FidoKey>> GetFidoKeys(User user);
    public Task DeleteFidoKey(User user, int id);

    public Task SendEmail(User user, (string Address, string Name) from, string subject, string textContent,
        string htmlContent);

    public Task UnverifyEmail(User user);
}