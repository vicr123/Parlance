using Parlance.Database;

namespace Parlance.Vicr123Accounts.Services.AttributionConsent;

public class AttributionConsentService : IAttributionConsentService
{
    private readonly ParlanceContext _parlanceContext;

    public AttributionConsentService(ParlanceContext parlanceContext)
    {
        _parlanceContext = parlanceContext;
    }

    public bool HaveConsent(User user)
    {
        return _parlanceContext.AttributionConsents.Any(x => x.UserId == user.Id);
    }

    public string PreferredUserName(User user)
    {
        return _parlanceContext.AttributionConsents.SingleOrDefault(x => x.UserId == user.Id)?.PreferredName ??
               user.Username;
    }

    public async Task SetPreferredUserName(User user, string? preferredName)
    {
        var consent = _parlanceContext.AttributionConsents.Single(x => x.UserId == user.Id);
        consent.PreferredName = preferredName;
        _parlanceContext.AttributionConsents.Update(consent);
        await _parlanceContext.SaveChangesAsync();
    }

    public async Task SetConsentStatus(User user, bool haveConsent)
    {
        if (haveConsent)
        {
            if (_parlanceContext.AttributionConsents.Any(x => x.UserId == user.Id)) return;
            _parlanceContext.AttributionConsents.Add(new Database.Models.AttributionConsent
            {
                UserId = user.Id
            });
        }
        else
        {
            if (!_parlanceContext.AttributionConsents.Any(x => x.UserId == user.Id)) return;
            _parlanceContext.AttributionConsents.RemoveRange(
                _parlanceContext.AttributionConsents.Where(x => x.UserId == user.Id));
        }

        await _parlanceContext.SaveChangesAsync();
    }
}