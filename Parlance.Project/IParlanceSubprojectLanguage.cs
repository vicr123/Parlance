using Parlance.CldrData;
using Parlance.Project.Index;
using Parlance.Project.TranslationFiles;

namespace Parlance.Project;

public interface IParlanceSubprojectLanguage
{
    public IParlanceSubproject Subproject { get; }
    public Locale Locale { get; }
    public Task<ParlanceTranslationFile?> CreateTranslationFile(IParlanceIndexingService? indexingService);
}