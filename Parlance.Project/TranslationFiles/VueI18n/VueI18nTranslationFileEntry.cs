namespace Parlance.Project.TranslationFiles.VueI18n;

// ReSharper disable once InconsistentNaming
public class VueI18nTranslationFileEntry : IParlanceTranslationFileEntry
{
    public required string Key { get; set; } = null!;
    public required string Source { get; set;  } = null!;
    public required IList<TranslationWithPluralType> Translation { get; set; } = null!;
    public required string Context { get; set;  } = null!;
    public required bool RequiresPluralisation { get; set; }
}