using Parlance.Project.TranslationFiles;
using Parlance.Project.TranslationFiles.QtLinguist;

namespace Parlance.Project;

public class ParlanceSubprojectLanguage : IParlanceSubprojectLanguage
{
    private readonly IParlanceSubproject _subproject;
    private readonly Locale _locale;

    public ParlanceSubprojectLanguage(IParlanceSubproject subproject, Locale locale)
    {
        _subproject = subproject;
        _locale = locale;
    }

    //TODO: Determine whether we need underscored or dashed format
    public IParlanceTranslationFile? TranslationFile => new QtLinguistTranslationFile(Path.Join(_subproject.Project.VcsDirectory, _subproject.Path.Replace("{lang}", _locale.ToUnderscored())), _locale);
}