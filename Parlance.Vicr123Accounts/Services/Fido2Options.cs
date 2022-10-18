namespace Parlance.Vicr123Accounts.Services;

public class Fido2Options
{
    public string ServerDomain { get; set; } = string.Empty;
    public IList<string> Origins { get; set; } = null!;
}