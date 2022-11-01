using Parlance.Vicr123Accounts.Services;

namespace Parlance.Services.AttributionConsent;

public interface IAttributionConsentService
{
    public bool HaveConsent(User user);
    public string PreferredUserName(User user);
    public Task SetPreferredUserName(User user, string? preferredName);
    public Task SetConsentStatus(User user, bool haveConsent);
}