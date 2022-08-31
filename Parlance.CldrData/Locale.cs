using System.Collections.Concurrent;
using System.Collections.Immutable;
using NCalc;
using Sepia.Globalization;
using Sepia.Globalization.Plurals;

namespace Parlance.CldrData;

public record LocalePluralRule(string Category, IList<int> Examples, int Index);

public record Locale(string LanguageCode, string? CountryCode, string? Script)
{
    private static readonly ConcurrentDictionary<Locale, IReadOnlyList<LocalePluralRule>> PluralCache = new();

    public string ToDashed()
    {
        var parts = new List<string> { LanguageCode };
        if (Script is not null) parts.Add(Script);
        if (CountryCode is not null) parts.Add(CountryCode);

        return string.Join('-', parts);
    }

    public string ToUnderscored()
    {
        var parts = new List<string> { LanguageCode };
        if (Script is not null) parts.Add(Script);
        if (CountryCode is not null) parts.Add(CountryCode.ToUpper());

        return string.Join('_', parts);
    }

    public IReadOnlyList<LocalePluralRule> PluralRules()
    {
        if (PluralCache.ContainsKey(this)) return PluralCache[this];

        //HACK: For some reason German doesn't seem to be working correctly so hardcode the English rules
        var plural = Plural.Create(Sepia.Globalization.Locale.Create(LanguageCode == "de" ? "en" : ToUnderscored()));

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
        })
        .GroupBy(item => item.Category)
        .Select((item, index) => new LocalePluralRule(item.Key, item.Select(x => x.Number).ToList(), item.Key == "other" ? 99 : index))
        .OrderBy(item => item.Index)
        .ToList();

        PluralCache.TryAdd(this, result);
        return result;
    }

    public static IEnumerable<Locale> GetLocales()
    {
        var dir = new DirectoryInfo(Path.Combine(Cldr.Instance.Repositories[0], "common/main"));
        return dir.EnumerateFiles().Select(info => Path.GetFileNameWithoutExtension(info.Name).ToLocale()).Distinct();
    }
}