namespace Parlance.Vicr123Accounts.Services;

// For when vicr123-accounts is not available on the platform (Windows, macOS)
public class Vicr123AccountsDummyService : IVicr123AccountsService
{
    private ulong _currentUserId;
    private readonly Dictionary<string, ulong> _users = new();
    private readonly Dictionary<string, string> _tokens = new();

    public Task<string> ProvisionTokenAsync(ProvisionTokenParameters parameters)
    {
        var random = new Random();
        var token = new string(Enumerable.Repeat("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz", 32)
            .Select(s => s[random.Next(s.Length)]).ToArray());
        _tokens.Add(token, parameters.Username);
        return Task.FromResult(token);
    }

    public async Task<User> UserByToken(string token)
    {
        return await UserByUsername(_tokens[token]);
    }

    public Task<User> UserById(ulong id)
    {
        return Task.FromResult(_users.Select(user => new User()
        {
            Email = $"{user.Key}@parlancetest",
            Id = user.Value,
            Username = user.Key
        }).First(user => user.Id == id));
    }

    public async Task<User> UserByUsername(string username)
    {
        if (_users.TryGetValue(username, out var userId)) return await UserById(userId);
        
        userId = _currentUserId++;
        _users.Add(username, userId);

        return await UserById(userId);
    }

    public Task<User> CreateUser(string username, string password, string email)
    {
        throw new NotSupportedException();
    }

    public Task<IEnumerable<IPasswordResetMethod>> PasswordResetMethods(User user)
    {
        throw new NotSupportedException();
    }

    public Task PerformPasswordReset(User user, string type, IDictionary<string, object> challenge)
    {
        throw new NotSupportedException();
    }

    public Task<bool> VerifyUserPassword(User user, string password)
    {
        return Task.FromResult(true);
    }

    public Task<User> UpdateUser(User user)
    {
        throw new NotSupportedException();
    }

    public Task UpdateUserPassword(User user, string newPassword)
    {
        throw new NotSupportedException();
    }

    public Task ResendVerificationEmail(User user)
    {
        throw new NotSupportedException();
    }

    public Task<bool> VerifyEmail(User user, string verificationCode)
    {
        throw new NotSupportedException();
    }

    public Task<bool> OtpEnabled(User user)
    {
        throw new NotSupportedException();
    }

    public Task<string> GenerateOtpKey(User user)
    {
        throw new NotSupportedException();
    }

    public Task EnableOtp(User user, string key)
    {
        throw new NotSupportedException();
    }

    public Task DisableOtp(User user)
    {
        throw new NotSupportedException();
    }

    public Task<IEnumerable<OtpBackupCode>> OtpBackupCodes(User user)
    {
        throw new NotSupportedException();
    }

    public Task RegenerateBackupCodes(User user)
    {
        throw new NotSupportedException();
    }
}