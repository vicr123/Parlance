using Microsoft.Extensions.FileSystemGlobbing;
using Microsoft.Extensions.FileSystemGlobbing.Abstractions;
using Parlance.CldrData;

namespace Parlance.Project;

public record SubprojectDefinition(string Name, string Type, string Path, string BaseLang);

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

    public IEnumerable<Locale> AvailableLanguages()
    {
        var wildcard = _subproject.Path.Replace("{lang}", "*");
        var toTrim = wildcard.Length - wildcard.IndexOf('*') - 1;
        
        var matcher = new Matcher();
        matcher.AddInclude(wildcard);
        var result = matcher.Execute(new DirectoryInfoWrapper(new DirectoryInfo(Project.VcsDirectory)));
        return result.Files.Select(file => file.Stem[..^toTrim].ToLocale());
    }

    public IParlanceSubprojectLanguage Language(Locale language)
    {
        return new ParlanceSubprojectLanguage(this, language);
    }
}