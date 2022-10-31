namespace Parlance.Project.TranslationFiles;

public class TranslationWithPluralType : IEquatable<TranslationWithPluralType>
{
    public string PluralType { get; set; } = null!;
    public string TranslationContent { get; set; } = null!;

    public bool Equals(TranslationWithPluralType? other)
    {
        if (ReferenceEquals(null, other)) return false;
        if (ReferenceEquals(this, other)) return true;
        return PluralType == other.PluralType && TranslationContent == other.TranslationContent;
    }

    public override bool Equals(object? obj)
    {
        if (ReferenceEquals(null, obj)) return false;
        if (ReferenceEquals(this, obj)) return true;
        if (obj.GetType() != GetType()) return false;
        return Equals((TranslationWithPluralType)obj);
    }

    public override int GetHashCode()
    {
        return HashCode.Combine(PluralType, TranslationContent);
    }
}

public interface IParlanceTranslationFileEntry
{
    public string Key { get; }
    public string Source { get; }
    public IList<TranslationWithPluralType> Translation { get; set; }
    public string Context { get; }
    public bool RequiresPluralisation { get; init; }
}