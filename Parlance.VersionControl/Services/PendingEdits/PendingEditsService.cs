using Parlance.CldrData;
using Parlance.Database;
using Parlance.Project;
using Parlance.Vicr123Accounts.Services;
using Parlance.Vicr123Accounts.Services.AttributionConsent;

namespace Parlance.VersionControl.Services.PendingEdits;

public class PendingEditsService(
    ParlanceContext parlanceContext,
    IVicr123AccountsService accountsService,
    IAttributionConsentService attributionConsentService)
    : IPendingEditsService
{
    public async Task RecordPendingEdit(IParlanceSubprojectLanguage parlanceSubprojectLanguage, User user)
    {
        if (parlanceContext.EditsPending.Any(x =>
                x.Project == parlanceSubprojectLanguage.Subproject.Project.Name &&
                x.Subproject == parlanceSubprojectLanguage.Subproject.Name &&
                x.Language == parlanceSubprojectLanguage.Locale.ToDatabaseRepresentation() &&
                x.UserId == user.Id)) return;

        parlanceContext.EditsPending.Add(new()
        {
            Project = parlanceSubprojectLanguage.Subproject.Project.Name,
            Subproject = parlanceSubprojectLanguage.Subproject.Name,
            Language = parlanceSubprojectLanguage.Locale.ToDatabaseRepresentation(),
            UserId = user.Id
        });

        await parlanceContext.SaveChangesAsync();
    }

    public async Task<IEnumerable<Editor>> EditorsPendingEdits(Database.Models.Project project)
    {
        var users = await Task.WhenAll(parlanceContext.EditsPending.Where(x => x.Project == project.Name)
            .AsEnumerable()
            .DistinctBy(x => x.UserId).Select(async x =>
            {
                var user = await accountsService.UserById(x.UserId);
                if (!attributionConsentService.HaveConsent(user)) return null;
                return new Editor
                {
                    Name = attributionConsentService.PreferredUserName(user),
                    Email = user.Email
                };
            }));
        return users.Where(x => x is not null).Cast<Editor>();
    }

    public IEnumerable<Locale> LocalesPendingEdits(Database.Models.Project project)
    {
        return parlanceContext.EditsPending.Where(x => x.Project == project.Name).AsEnumerable()
            .DistinctBy(x => x.Language).Select(x => Locale.FromDatabaseRepresentation(x.Language))
            .Where(x => x is not null).Cast<Locale>();
    }

    public async Task ClearPendingEdits(Database.Models.Project project)
    {
        parlanceContext.EditsPending.RemoveRange(parlanceContext.EditsPending.Where(x => x.Project == project.Name));
        await parlanceContext.SaveChangesAsync();
    }
}