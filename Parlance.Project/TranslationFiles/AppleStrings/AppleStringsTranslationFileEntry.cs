namespace Parlance.Project.TranslationFiles.AppleStrings;

public class AppleStringsTranslationFileEntry : IParlanceTranslationFileEntry
{
    public required string Key { get; init; }
    public required string Source { get; init; }
    public required IList<TranslationWithPluralType> Translation { get; set; }
    public required string Context { get; init; }
    public bool RequiresPluralisation { get; set; }
    public required string? Comment { get; init; }
}