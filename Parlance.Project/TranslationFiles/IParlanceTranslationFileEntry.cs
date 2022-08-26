namespace Parlance.Project.TranslationFiles;

public class TranslationWithPluralType
{
    public string PluralType { get; set; } = null!;
    public string TranslationContent { get; set; } = null!;
}

public interface IParlanceTranslationFileEntry
{
    public string Key { get; }
    public string Source { get; }
    public IList<TranslationWithPluralType> Translation { get; set; }
    public string Context { get; }
    public bool RequiresPluralisation { get; init; }
}