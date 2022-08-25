using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Sepia.Globalization;
using Sepia.Globalization.Plurals;

namespace Parlance.CLDR;

public static class CldrExtensions
{
    public static async Task DownloadCldrData()
    {
        await Cldr.Instance.DownloadLatestAsync();
    }
    
    public static IServiceCollection AddCldr(this IServiceCollection services, IConfiguration configuration)
    {
        return services;
    }

    public static Locale ToLocale(this string localeIdentifier)
    {
        if (localeIdentifier.Contains("-"))
        {
            var parts = localeIdentifier.Split("-");
            return new Locale(parts[0], parts[1]);
        }

        if (localeIdentifier.Contains("_"))
        {
            var parts = localeIdentifier.Split("_");
            return new Locale(parts[0], parts[1]);
        }

        return new Locale(localeIdentifier, null);
    }

    public static IEnumerable<int> GetExamples(this Rule pluralRule)
    {
        return Enumerable.Range(0, 201).Where(num =>
        {
            try
            {
                return pluralRule.Matches(RuleContext.Create(num));
            }
            catch
            {
                return false;
            }
        });
    }
}