using Sepia.Globalization;
using Sepia.Globalization.Plurals;

namespace Parlance.Project;

public record Locale
{
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

    public IEnumerable<Rule> PluralRules()
    {
        return Cldr.Instance
            .GetDocuments("common/supplemental/plurals.xml")
            .Elements(
                $"supplementalData/plurals[@type='cardinal']/pluralRules[contains(@locales, '{LanguageCode}')]/pluralRule")
            .Select(Rule.Parse);
    }
}