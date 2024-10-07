namespace Parlance.Project.TranslationFiles.VueI18n;

// ReSharper disable once InconsistentNaming
public class VueI18nTranslationFileEntry : IParlanceTranslationFileEntry
{
    public required string Key { get; set; }
    public required string Source { get; set;  }
    public required IList<TranslationWithPluralType> Translation { get; set; }
    public required string Context { get; set; }
    public required bool RequiresPluralisation { get; set; }
    public required string? Comment { get; set; }
}