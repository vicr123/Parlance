using System.Collections.Immutable;
using Sepia.Globalization;
using Sepia.Globalization.Plurals;

namespace Parlance.CLDR;

public record LocalePluralRule(string Category, IList<int> Examples, int Index);

public record Locale
{
    private static readonly Dictionary<Locale, IImmutableList<LocalePluralRule>> PluralCache = new();

    public Locale(string languageCode, string? countryCode)
    {
        LanguageCode = languageCode.ToLower();
        CountryCode = countryCode?.ToLower();
    }

    public string LanguageCode { get; }
    public string? CountryCode { get; }

    public void Deconstruct(out string languageCode, out string? countryCode)
    {
        languageCode = this.LanguageCode;
        countryCode = this.CountryCode;
    }

    public string ToDashed()
    {
        if (CountryCode is null) return LanguageCode;
        return $"{LanguageCode}-{CountryCode.ToUpper()}";
    }

    public string ToUnderscored()
    {
        if (CountryCode is null) return LanguageCode;
        return $"{LanguageCode}_{CountryCode.ToUpper()}";
    }

    public IImmutableList<LocalePluralRule> PluralRules()
    {
        if (PluralCache.ContainsKey(this)) return PluralCache[this];
        
        var plural = Plural.Create(Sepia.Globalization.Locale.Create(ToUnderscored()));
        var result = Enumerable.Range(0, 201).Select(num =>
        {
            try
            {
                return new
                {
                    Category = plural.Category(num),
                    Number = num
                };
            }
            catch
            {
                return new
                {
                    Category = "other",
                    Number = num
                };
            }
        }).GroupBy(item => item.Category).Select((item, index) => new LocalePluralRule(item.Key, item.Select(x => x.Number).ToList(), item.Key == "other" ? 99 : index)).OrderBy(item => item.Index).ToImmutableList();
        
        PluralCache.Add(this, result);
        return result;
    }
}