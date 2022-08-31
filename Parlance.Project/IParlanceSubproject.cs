using Parlance.CldrData;

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

    public IEnumerable<Locale> AvailableLanguages();
    public IParlanceSubprojectLanguage Language(Locale language);
}