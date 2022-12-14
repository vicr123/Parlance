using System.Reflection;
using Microsoft.Extensions.FileSystemGlobbing;
using Microsoft.Extensions.FileSystemGlobbing.Abstractions;
using Parlance.CldrData;
using Parlance.Project.TranslationFiles;

namespace Parlance.Project;

public record SubprojectDefinition(string Name, string Type, string Path, string BaseLang, string? BasePath,
    IDictionary<string, object> Options);

public class ParlanceSubproject : IParlanceSubproject
{
    private readonly SubprojectDefinition _subproject;

    public ParlanceSubproject(IParlanceProject project, SubprojectDefinition subproject)
    {
        Project = project;
        _subproject = subproject;
    }

    public string Name => _subproject.Name;
    public string SystemName => _subproject.Name.ToLower().Replace(" ", "-");
    public IParlanceProject Project { get; }
    public string Path => _subproject.Path;
    public string TranslationFileType => _subproject.Type;
    public Locale BaseLang => _subproject.BaseLang.ToLocale();

    public string BasePath => 
        System.IO.Path.Join(Project.VcsDirectory, _subproject.BasePath ??
                    Path.Replace("{lang}",
                        typeof(ParlanceProjectExtensions).Assembly
                        .GetTypes()
                        .Where(t => t.IsDefined(typeof(TranslationFileTypeAttribute)))
                        .Select(type => type.GetCustomAttribute<TranslationFileTypeAttribute>()!)
                        .Single(attr => attr.HandlerFor == TranslationFileType).FileNameFormat
                        switch
                        {
                            ExpectedTranslationFileNameFormat.Dashed => BaseLang.ToDashed(),
                            ExpectedTranslationFileNameFormat.Underscored => BaseLang.ToUnderscored(),
                            _ => throw new ArgumentOutOfRangeException("Invalid value for FileNameFormat.")
                        }));

    public IDictionary<string, object> Options => _subproject.Options;

    public IEnumerable<Locale> AvailableLanguages()
    {
        var wildcard = _subproject.Path.Replace("{lang}", "*");
        var toTrim = wildcard.Length - wildcard.IndexOf('*') - 1;
        var toStart = wildcard.IndexOf('*') - 1;

        var matcher = new Matcher();
        matcher.AddInclude(wildcard);
        var result = matcher.Execute(new DirectoryInfoWrapper(new DirectoryInfo(Project.VcsDirectory)));
        return result.Files.Select(file => file.Path[toStart..^toTrim].ToLocale());
    }

    public IParlanceSubprojectLanguage Language(Locale language)
    {
        return new ParlanceSubprojectLanguage(this, language);
    }
}