using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Sepia.Globalization;
using Sepia.Globalization.Plurals;

namespace Parlance.CLDR;

public static class CldrExtensions
{
    private static readonly List<string> Scripts = new List<string>();
    
    public static async Task DownloadCldrData()
    {
        await Cldr.Instance.DownloadLatestAsync();

        var scriptMetadata = Cldr.Instance.GetTextDocuments("common/properties/scriptMetadata.txt");
        foreach (var reader in scriptMetadata)
        {
            while (!reader.EndOfStream)
            {
                var line = await reader.ReadLineAsync();
                if (line == null || line.StartsWith("#")) continue;
                
                Scripts.Add(line.Split(";")[0]);
            }
        }
    }
    
    public static IServiceCollection AddCldr(this IServiceCollection services, IConfiguration configuration)
    {
        return services;
    }

    public static Locale ToLocale(this string localeIdentifier)
    {
        Queue<string>? parts = null;
        if (localeIdentifier.Contains("-"))
        {
            parts = new Queue<string>(localeIdentifier.Split("-"));
        }

        if (localeIdentifier.Contains("_"))
        {
            parts = new Queue<string>(localeIdentifier.Split("_"));
        }

        if (parts is null) return new Locale(localeIdentifier, null, null);
        
        var languageCode = parts.Dequeue();
        string? script = null;
        string? countryCode = null;

        if (parts.Count > 0)
        {
            if (Scripts.Contains(parts.Peek())) script = parts.Dequeue();
        }

        if (parts.Count > 0)
        {
            countryCode = parts.Dequeue();
        }
            
        return new Locale(languageCode, countryCode, script);
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