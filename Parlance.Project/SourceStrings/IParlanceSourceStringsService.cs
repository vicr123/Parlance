using Parlance.Project.TranslationFiles;

namespace Parlance.Project.SourceStrings;

public interface IParlanceSourceStringsService
{
    public Task RegisterSourceStringChange(IParlanceSubprojectLanguage translationFile,
        IParlanceTranslationFileEntry entry);

    public Task<string?> GetSourceStringChange(IParlanceSubprojectLanguage translationFile,
        IParlanceTranslationFileEntry entry);
}