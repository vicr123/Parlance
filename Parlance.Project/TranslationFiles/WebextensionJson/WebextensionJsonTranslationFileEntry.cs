using System.Text.Json.Nodes;

namespace Parlance.Project.TranslationFiles.WebextensionJson;

public class WebextensionJsonTranslationFileEntry : IParlanceTranslationFileEntry
{
    public string Key { get; set; }
    public string Source { get; set;  }
    public IList<TranslationWithPluralType> Translation { get; set; }
    public string Context { get; set;  }
    public bool RequiresPluralisation { get; init; }
    public string? Description { get; set; }
    public JsonObject? Placeholders { get; set; }
}