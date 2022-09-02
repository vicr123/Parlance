using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Sepia.Globalization;
using Sepia.Globalization.Plurals;

namespace Parlance.CldrData;

public static class CldrExtensions
{
    private static readonly Lazy<Task<List<string>>> scripts = new(async () => 
    {
        var scripts = new List<string>();
        var scriptMetadata = Cldr.Instance.GetTextDocuments("common/properties/scriptMetadata.txt");
        foreach (var reader in scriptMetadata)
        {
            while (!reader.EndOfStream)
            {
                var line = await reader.ReadLineAsync();
                if (line == null || line.StartsWith("#")) continue;
                
                scripts.Add(line.Split(";")[0]);
            }
        }
        return scripts;
    }, LazyThreadSafetyMode.ExecutionAndPublication);

    private static List<string> Scripts => scripts.Value.Result;
        
    public static async Task<IServiceCollection> AddCldrAsync(this IServiceCollection services, IConfiguration configuration)
    {
        await Cldr.Instance.DownloadLatestAsync();
        return services;
    }

    public static Locale ToLocale(this string localeIdentifier)
    {
        Queue<string>? parts = null;
        if (localeIdentifier.Contains('-'))
        {
            parts = new Queue<string>(localeIdentifier.Split('-'));
        }

        if (localeIdentifier.Contains('_'))
        {
            parts = new Queue<string>(localeIdentifier.Split('_'));
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