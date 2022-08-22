using Parlance.Project.TranslationFiles;

namespace Parlance.Project;

public interface IParlanceSubprojectLanguage
{
    public IParlanceTranslationFile? TranslationFile { get; }
}