using System.Reflection;
using Microsoft.Extensions.FileSystemGlobbing;
using Microsoft.Extensions.FileSystemGlobbing.Abstractions;
using Parlance.CldrData;
using Parlance.Project.TranslationFiles;

namespace Parlance.Project;

public record SubprojectDefinition(string Name, string Type, string Path, string BaseLang, string? BasePath,
    IDictionary<string, object> Options, bool? PreferRegionAgnosticLanguage);

public class ParlanceSubproject(IParlanceProject project, SubprojectDefinition subproject) : IParlanceSubproject
{
    public string Name => subproject.Name;
    public string SystemName => subproject.Name.ToLower().Replace(" ", "-");
    public IParlanceProject Project { get; } = project;
    public string Path => subproject.Path;
    public string TranslationFileType => subproject.Type;
    public Locale BaseLang => subproject.BaseLang.ToLocale();

    public bool PreferRegionAgnosticLanguage =>
        subproject.PreferRegionAgnosticLanguage ?? string.IsNullOrEmpty(BaseLang.CountryCode);

    public string BasePath
    {
        get
        {
            var language = typeof(ParlanceProjectExtensions).Assembly
                    .GetTypes()
                    .Where(t => t.IsDefined(typeof(TranslationFileTypeAttribute)))
                    .SelectMany(type => type.GetCustomAttributes<TranslationFileTypeAttribute>())
                    .Single(attr => attr.HandlerFor == TranslationFileType)
                    .FileNameFormat switch
                    {
                        ExpectedTranslationFileNameFormat.Dashed => BaseLang.ToDashed(),
                        ExpectedTranslationFileNameFormat.Underscored => BaseLang.ToUnderscored(),
                        _ => throw new ArgumentOutOfRangeException("Invalid value for FileNameFormat.")
                    };

            var standardCased = System.IO.Path.Join(Project.VcsDirectory,
                subproject.BasePath ?? Path.Replace("{lang}", language));
            var lowerCased = System.IO.Path.Join(Project.VcsDirectory,
                subproject.BasePath ?? Path.Replace("{lang}", language.ToLowerInvariant()));

            if (!File.Exists(standardCased) && File.Exists(lowerCased)) return lowerCased;
            return standardCased;
        }
    }

    public IDictionary<string, object> Options => subproject.Options;

    public Locale CalculatePreferredLocale(Locale locale)
    {
        if (!PreferRegionAgnosticLanguage) return locale;
        if (AvailableLanguages().Contains(locale)) return locale;
        return locale with
        {
            CountryCode = null
        };
    }

    public IEnumerable<Locale> AvailableLanguages()
    {
        var wildcard = subproject.Path.Replace("{lang}", "*");
        var toTrim = wildcard.Length - wildcard.IndexOf('*') - 1;
        var toStart = wildcard.IndexOf('*') - 1;

        var matcher = new Matcher();
        matcher.AddInclude(wildcard);
        var result = matcher.Execute(new DirectoryInfoWrapper(new DirectoryInfo(Project.VcsDirectory)));
        return result.Files.Select(file => file.Path[toStart..^toTrim]).Where(file => file != "meta").Select(file => file.ToLocale());
    }

    public IParlanceSubprojectLanguage Language(Locale language)
    {
        return new ParlanceSubprojectLanguage(this, language);
    }
}