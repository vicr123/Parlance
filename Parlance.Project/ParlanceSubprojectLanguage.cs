using Parlance.Project.TranslationFiles;
using Parlance.Project.TranslationFiles.QtLinguist;

namespace Parlance.Project;

public class ParlanceSubprojectLanguage : IParlanceSubprojectLanguage
{
    private readonly IParlanceSubproject _subproject;
    private readonly string _language;

    public ParlanceSubprojectLanguage(IParlanceSubproject subproject, string language)
    {
        _subproject = subproject;
        _language = language;
    }

    public IParlanceTranslationFile? TranslationFile => new QtLinguistTranslationFile(Path.Join(_subproject.Project.VcsDirectory, _subproject.Path.Replace("{lang}", _language)));
}