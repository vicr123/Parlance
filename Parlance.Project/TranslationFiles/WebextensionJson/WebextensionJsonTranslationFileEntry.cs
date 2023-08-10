using System.Text.Json.Nodes;

namespace Parlance.Project.TranslationFiles.WebextensionJson;

public class WebextensionJsonTranslationFileEntry : IParlanceTranslationFileEntry
{
    public string Key { get; set; } = null!;
    public string Source { get; set;  } = null!;
    public IList<TranslationWithPluralType> Translation { get; set; } = null!;
    public string Context { get; set;  } = null!;
    public bool RequiresPluralisation { get; set; }
    public string? Description { get; set; }
    public JsonObject? Placeholders { get; set; }
}