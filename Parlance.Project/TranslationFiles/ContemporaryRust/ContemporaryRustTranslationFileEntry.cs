namespace Parlance.Project.TranslationFiles.ContemporaryRust;

public class ContemporaryRustTranslationFileEntry : IParlanceTranslationFileEntry
{
    public string Key { get; init; }
    public string Source { get; init; }
    public IList<TranslationWithPluralType> Translation { get; set; }
    public string Context { get; init; }
    public bool RequiresPluralisation { get; set; }
    public string? Comment { get; init; }
}