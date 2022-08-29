namespace Parlance.Vicr123Accounts.Services;

public class ProvisionTokenParameters
{
    public string Username { get; init; } = null!;
    public string Password { get; init; } = null!;
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
    
}

public class EmailPasswordResetMethod : IPasswordResetMethod
{
    public string Domain { get; init; } = null!;
    public string User { get; init; } = null!;
}

public class SomeOther : IPasswordResetMethod
{
    
}

public class OtpBackupCode
{
    public string Code { get; init; } = null!;
    public bool Used { get; init; }
}

public interface IVicr123AccountsService
{
    public Task<string> ProvisionTokenAsync(ProvisionTokenParameters parameters);
    public Task<User> UserByToken(string token);
    public Task<User> UserById(ulong id);
    public Task<User> UserByUsername(string username);
    public Task<User> CreateUser(string username, string password, string email);
    public Task<IEnumerable<IPasswordResetMethod>> PasswordResetMethods(User user);
    public Task PerformPasswordReset(User user, string type, IDictionary<string, object> challenge);
    public Task<bool> VerifyUserPassword(User user, string password);
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
}