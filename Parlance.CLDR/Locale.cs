using System.Collections.Immutable;
using Sepia.Globalization;
using Sepia.Globalization.Plurals;

namespace Parlance.CLDR;

public record LocalePluralRule(string Category, IList<int> Examples, int Index);

public record Locale
{
    private static readonly Dictionary<Locale, IImmutableList<LocalePluralRule>> PluralCache = new();

    public Locale(string languageCode, string? countryCode, string? script)
    {
        LanguageCode = languageCode.ToLower();
        CountryCode = countryCode?.ToLower();
        Script = script;
    }

    public string LanguageCode { get; }
    public string? CountryCode { get; }
    public string? Script { get; }

    public void Deconstruct(out string languageCode, out string? countryCode, out string? script)
    {
        languageCode = this.LanguageCode;
        countryCode = this.CountryCode;
        script = this.Script;
    }

    public string ToDashed()
    {
        var parts = new List<string>();
        parts.Add(LanguageCode);
        if (Script is not null) parts.Add(Script);
        if (CountryCode is not null) parts.Add(CountryCode);

        return string.Join('-', parts);
    }

    public string ToUnderscored()
    {
        var parts = new List<string>();
        parts.Add(LanguageCode);
        if (Script is not null) parts.Add(Script);
        if (CountryCode is not null) parts.Add(CountryCode.ToUpper());

        return string.Join('_', parts);
    }

    public IImmutableList<LocalePluralRule> PluralRules()
    {
        lock (PluralCache)
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

    public static IEnumerable<Locale> GetLocales()
    {
        var dir = new DirectoryInfo(Path.Combine(Cldr.Instance.Repositories[0], "common/main"));
        return dir.EnumerateFiles().Select(info => Path.GetFileNameWithoutExtension(info.Name).ToLocale()).Distinct();
    }
}