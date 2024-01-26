using Parlance.Database;
using Parlance.Project.TranslationFiles;

namespace Parlance.Project.SourceStrings;

public class ParlanceSourceStringsService(ParlanceContext parlanceContext) : IParlanceSourceStringsService
{
    public async Task RegisterSourceStringChange(IParlanceSubprojectLanguage translationFile,
        IParlanceTranslationFileEntry entry)
    {
        parlanceContext.SourceStrings.RemoveRange(parlanceContext.SourceStrings.Where(x =>
            x.Project == translationFile.Subproject.Project.Name &&
            x.Subproject == translationFile.Subproject.SystemName &&
            x.Language == translationFile.Locale.ToDatabaseRepresentation() && x.Key == entry.Key));
        parlanceContext.SourceStrings.Add(new Database.Models.SourceStrings
        {
            Project = translationFile.Subproject.Project.Name,
            Subproject = translationFile.Subproject.SystemName,
            Language = translationFile.Locale.ToDatabaseRepresentation(),
            Key = entry.Key,
            SourceTranslation = entry.Source
        });

        await parlanceContext.SaveChangesAsync();
    }

    public Task<string?> GetSourceStringChange(IParlanceSubprojectLanguage translationFile,
        IParlanceTranslationFileEntry entry)
    {
        var oldSourceString = parlanceContext.SourceStrings.SingleOrDefault(x =>
            x.Project == translationFile.Subproject.Project.Name &&
            x.Subproject == translationFile.Subproject.SystemName &&
            x.Language == translationFile.Locale.ToDatabaseRepresentation() && x.Key == entry.Key);

        if (oldSourceString == default) return Task.FromResult<string?>(null);
        if (oldSourceString.SourceTranslation == entry.Source) return Task.FromResult<string?>(null);
        return Task.FromResult<string?>(oldSourceString.SourceTranslation);
    }
}