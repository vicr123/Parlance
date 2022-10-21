using System.Text.Json;

namespace Parlance.Project;

internal record ParlanceJson(string Name, IEnumerable<SubprojectDefinition> Subprojects);

public class ParlanceProject : IParlanceProject
{
    private static readonly JsonSerializerOptions Options = new()
    {
        PropertyNameCaseInsensitive = true
    };

    private readonly Database.Models.Project _project;

    public ParlanceProject(Database.Models.Project project)
    {
        _project = project;
        using var file = File.OpenRead(Path.Combine(project.VcsDirectory, ".parlance.json"));
        var subprojectDefs = JsonSerializer.Deserialize<ParlanceJson>(file, Options);

        if (subprojectDefs is null) throw new InvalidDataException("The Parlance project definition is invalid.");

        ReadableName = subprojectDefs.Name;
        Subprojects = subprojectDefs.Subprojects.Select(subproject => new ParlanceSubproject(this, subproject))
            .ToList()
            .AsReadOnly();
    }

    public string ReadableName { get; }

    public string Name => _project.Name;
    public string VcsDirectory => _project.VcsDirectory;
    public IReadOnlyList<IParlanceSubproject> Subprojects { get; }

    public IParlanceSubproject SubprojectBySystemName(string systemName)
    {
        return Subprojects.FirstOrDefault(subproject => subproject.SystemName == systemName)
               ?? throw new SubprojectNotFoundException();
    }
}