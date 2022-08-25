using Parlance.CLDR;

namespace Parlance.Project;

public class SubprojectNotFoundException : InvalidOperationException
{
    
}

public interface IParlanceSubproject
{
    public string Name { get; }
    public string SystemName { get; }
    public IParlanceProject Project { get; }
    public string Path { get; }
    public string TranslationFileType { get; }

    public IEnumerable<string> AvailableLanguages();
    public IParlanceSubprojectLanguage Language(Locale language);
}