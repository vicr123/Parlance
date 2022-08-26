namespace Parlance.Project.TranslationFiles.QtLinguist;

public class QtLinguistTranslationFileEntry : IParlanceTranslationFileEntry
{
    public record Location(string Filename, string Line);

    public string Key { get; init; } = null!;
    public string Source { get; init; } = null!;
    public IList<TranslationWithPluralType> Translation { get; set; } = null!;
    public string Context { get; init; } = null!;
    public bool RequiresPluralisation { get; init; }
    public IEnumerable<Location> Locations { get; init; } = null!;
}