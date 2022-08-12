namespace Parlance.Vicr123Accounts.Services;

public class ProvisionTokenParameters
{
    public string Username { get; init; }
    public string Password { get; init; }
    public string? OtpToken { get; init; }
    public string? NewPassword { get; init; }
}

public class User
{
    public ulong Id { get; set; }
    public string Username { get; set; } = null!;
    public string Email { get; init; } = null!;
}

public interface IVicr123AccountsService
{
    public Task<string> ProvisionTokenAsync(ProvisionTokenParameters parameters);
    public Task<User> UserByToken(string token);
    public Task<User> UserById(ulong id);
    public Task<User> UserByUsername(string username);
    public Task<User> CreateUser(string username, string password, string email);
}