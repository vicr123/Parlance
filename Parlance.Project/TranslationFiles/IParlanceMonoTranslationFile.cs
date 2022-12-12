using System.Runtime.Versioning;
using Parlance.CldrData;
using Parlance.Project.Index;

namespace Parlance.Project.TranslationFiles;

public interface IParlanceMonoTranslationFile
{
    public static abstract Task<ParlanceTranslationFile> CreateAsync(string file, Locale locale, string baseFile, Locale baseLocale,
        IParlanceSubprojectLanguage? subprojectLanguage, IParlanceIndexingService? indexingService);
}