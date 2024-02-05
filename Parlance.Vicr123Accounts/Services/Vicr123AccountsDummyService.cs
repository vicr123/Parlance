using System.Collections.Concurrent;
using System.Text.Json;
using Fido2NetLib;

namespace Parlance.Vicr123Accounts.Services;

// For when vicr123-accounts is not available on the platform (Windows, macOS)
public class Vicr123AccountsDummyService : IVicr123AccountsService
{
    private readonly ConcurrentDictionary<string, string> _tokens = new();
    private readonly ConcurrentDictionary<string, ulong> _users = new();
    private ulong _currentUserId;

    public Task<string> ProvisionTokenAsync(ProvisionTokenParameters parameters)
    {
        var token = string.Concat(Enumerable.Repeat("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz", 32)
            .Select(s => s[Random.Shared.Next(s.Length)]));
        _tokens.TryAdd(token, parameters.Username);
        return Task.FromResult(token);
    }

    public Task<string> ForceProvisionTokenAsync(ulong userId)
    {
        throw new NotSupportedException();
    }

    public async Task<User> UserByToken(string token)
    {
        return await UserByUsername(_tokens[token]);
    }

    public Task<User> UserById(ulong id)
    {
        return Task.FromResult(
            _users.Where(user => user.Value == id)
                .Select(user => new User
                {
                    Email = $"{user.Key}@parlancetest",
                    Id = user.Value,
                    Username = user.Key
                }).First());
    }

    public async Task<User> UserByUsername(string username)
    {
        if (_users.TryGetValue(username, out var userId)) return await UserById(userId);

        userId = Interlocked.Increment(ref _currentUserId);
        _users.TryAdd(username, userId);

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

    public Task<string> PrepareRegisterFidoKey(User user, int crossPlatformAttachment)
    {
        throw new NotSupportedException();
    }

    public Task FinishRegisterFidoKey(User user, JsonElement response, string name)
    {
        throw new NotSupportedException();
    }

    public Task<IEnumerable<string>> LoginMethods(string username)
    {
        return Task.FromResult<IEnumerable<string>>(new List<string>
        {
            "password"
        });
    }

    public Task<IDictionary<string, object>> ProvisionTokenByMethodAsync(string method, string username,
        IDictionary<string, object> parameters)
    {
        //TODO
        throw new NotImplementedException();
    }

    public Task<(int, AssertionOptions)> GetFidoAssertionOptions(string username)
    {
        throw new NotSupportedException();
    }

    public Task<string> ProvisionTokenViaFido(int id, AuthenticatorAssertionRawResponse response)
    {
        throw new NotSupportedException();
    }

    public Task<IEnumerable<FidoKey>> GetFidoKeys(User user)
    {
        throw new NotSupportedException();
    }

    public Task DeleteFidoKey(User user, int id)
    {
        throw new NotSupportedException();
    }

    public Task SendEmail(User user, (string Address, string Name) from, string subject, string textContent, string htmlContent)
    {
        throw new NotSupportedException();
    }

    public Task UnverifyEmail(User user)
    {
        throw new NotSupportedException();
    }
}