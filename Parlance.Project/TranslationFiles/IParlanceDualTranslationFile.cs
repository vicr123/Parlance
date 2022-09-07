using System.Runtime.Versioning;
using Parlance.CldrData;
using Parlance.Project.Index;

namespace Parlance.Project.TranslationFiles;

[RequiresPreviewFeatures]
public interface IParlanceDualTranslationFile
{
    public static abstract Task<ParlanceTranslationFile> CreateAsync(string file, Locale locale,
        IParlanceSubprojectLanguage? subprojectLanguage, IParlanceIndexingService? indexingService);
}