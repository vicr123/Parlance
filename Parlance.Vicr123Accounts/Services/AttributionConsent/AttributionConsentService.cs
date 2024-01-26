using Parlance.Database;

namespace Parlance.Vicr123Accounts.Services.AttributionConsent;

public class AttributionConsentService(ParlanceContext parlanceContext) : IAttributionConsentService
{
    public bool HaveConsent(User user)
    {
        return parlanceContext.AttributionConsents.Any(x => x.UserId == user.Id);
    }

    public string PreferredUserName(User user)
    {
        return parlanceContext.AttributionConsents.SingleOrDefault(x => x.UserId == user.Id)?.PreferredName ??
               user.Username;
    }

    public async Task SetPreferredUserName(User user, string? preferredName)
    {
        var consent = parlanceContext.AttributionConsents.Single(x => x.UserId == user.Id);
        consent.PreferredName = preferredName;
        parlanceContext.AttributionConsents.Update(consent);
        await parlanceContext.SaveChangesAsync();
    }

    public async Task SetConsentStatus(User user, bool haveConsent)
    {
        if (haveConsent)
        {
            if (parlanceContext.AttributionConsents.Any(x => x.UserId == user.Id)) return;
            parlanceContext.AttributionConsents.Add(new Database.Models.AttributionConsent
            {
                UserId = user.Id
            });
        }
        else
        {
            if (!parlanceContext.AttributionConsents.Any(x => x.UserId == user.Id)) return;
            parlanceContext.AttributionConsents.RemoveRange(
                parlanceContext.AttributionConsents.Where(x => x.UserId == user.Id));
        }

        await parlanceContext.SaveChangesAsync();
    }
}