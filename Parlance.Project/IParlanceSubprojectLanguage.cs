using Parlance.Project.TranslationFiles;

namespace Parlance.Project;

public interface IParlanceSubprojectLanguage
{
    public Task<IParlanceTranslationFile?> CreateTranslationFile();
}