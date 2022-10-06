namespace Parlance.Project.TranslationFiles.I18nextJson;

public class I18NextJsonTranslationFileEntry : IParlanceTranslationFileEntry
{
    public string Key { get; set; } = null!;
    public string Source { get; set; } = null!;
    public IList<TranslationWithPluralType> Translation { get; set; } = null!;
    public string Context { get; set; } = null!;
    public bool RequiresPluralisation { get; init; }
}