using Parlance.CLDR;
using Parlance.Project.Index;

namespace Parlance.Project.TranslationFiles;

public interface IParlanceDualTranslationFile
{
    public static abstract Task<ParlanceTranslationFile> CreateAsync(string file, Locale locale,
        IParlanceSubprojectLanguage? subprojectLanguage, IParlanceIndexingService? indexingService);
}