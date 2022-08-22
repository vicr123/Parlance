namespace Parlance.Project.TranslationFiles.QtLinguist;

public class QtLinguistTranslationFileEntry : IParlanceTranslationFileEntry
{
    public record Location(string Filename, string Line);

    public string Key { get; init; }
    public string Source { get; init; }
    public IList<string> Translation { get; set; }
    public string Context { get; init; }
    public bool RequiresPluralisation { get; init; }
    public IEnumerable<Location> Locations { get; init; }
}