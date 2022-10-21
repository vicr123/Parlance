using Parlance.Database;
using Parlance.Project.TranslationFiles;

namespace Parlance.Project.SourceStrings;

public class ParlanceSourceStringsService : IParlanceSourceStringsService
{
    private readonly ParlanceContext _parlanceContext;

    public ParlanceSourceStringsService(ParlanceContext parlanceContext)
    {
        _parlanceContext = parlanceContext;
    }

    public async Task RegisterSourceStringChange(IParlanceSubprojectLanguage translationFile,
        IParlanceTranslationFileEntry entry)
    {
        _parlanceContext.SourceStrings.RemoveRange(_parlanceContext.SourceStrings.Where(x =>
            x.Project == translationFile.Subproject.Project.Name &&
            x.Subproject == translationFile.Subproject.SystemName &&
            x.Language == translationFile.Locale.ToDatabaseRepresentation() && x.Key == entry.Key));
        _parlanceContext.SourceStrings.Add(new Database.Models.SourceStrings
        {
            Project = translationFile.Subproject.Project.Name,
            Subproject = translationFile.Subproject.SystemName,
            Language = translationFile.Locale.ToDatabaseRepresentation(),
            Key = entry.Key,
            SourceTranslation = entry.Source
        });

        await _parlanceContext.SaveChangesAsync();
    }

    public Task<string?> GetSourceStringChange(IParlanceSubprojectLanguage translationFile,
        IParlanceTranslationFileEntry entry)
    {
        var oldSourceString = _parlanceContext.SourceStrings.SingleOrDefault(x =>
            x.Project == translationFile.Subproject.Project.Name &&
            x.Subproject == translationFile.Subproject.SystemName &&
            x.Language == translationFile.Locale.ToDatabaseRepresentation() && x.Key == entry.Key);

        if (oldSourceString == default) return Task.FromResult<string?>(null);
        if (oldSourceString.SourceTranslation == entry.Source) return Task.FromResult<string?>(null);
        return Task.FromResult<string?>(oldSourceString.SourceTranslation);
    }
}