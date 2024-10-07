using System.Text.Json.Nodes;

namespace Parlance.Project.TranslationFiles.WebextensionJson;

public class WebextensionJsonTranslationFileEntry : IParlanceTranslationFileEntry
{
    public required string Key { get; set; }
    public required string Source { get; set;  }
    public required IList<TranslationWithPluralType> Translation { get; set; }
    public required string Context { get; set;  }
    public bool RequiresPluralisation { get; set; }
    public required string? Comment { get; set; }
    public string? Description { get; set; }
    public JsonObject? Placeholders { get; set; }
}