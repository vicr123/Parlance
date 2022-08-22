namespace Parlance.Project.TranslationFiles;

public interface IParlanceTranslationFileEntry
{
    public string Key { get; }
    public string Source { get; }
    public IList<string> Translation { get; set; }
    public string Context { get; }
    public bool RequiresPluralisation { get; init; }
}