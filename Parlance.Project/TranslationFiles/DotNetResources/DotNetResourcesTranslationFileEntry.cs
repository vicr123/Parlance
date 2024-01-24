namespace Parlance.Project.TranslationFiles.DotNetResources;

public class DotNetResourcesTranslationFileEntry : IParlanceTranslationFileEntry
{
    public string Key { get; set; }
    public string Source { get; set; }
    public IList<TranslationWithPluralType> Translation { get; set; }
    public string Context { get; set; }
    public bool RequiresPluralisation { get; set; }
}