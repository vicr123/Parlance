namespace Parlance.Project.TranslationFiles.DotNetResources;

public class DotNetResourcesTranslationFileEntry : IParlanceTranslationFileEntry
{
    public required string Key { get; set; }
    public required string Source { get; set; }
    public required IList<TranslationWithPluralType> Translation { get; set; }
    public required string Context { get; set; }
    public bool RequiresPluralisation { get; set; }
    public required string? Comment { get; init; }
}