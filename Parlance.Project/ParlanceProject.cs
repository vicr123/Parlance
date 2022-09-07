using System.Text.Json;

namespace Parlance.Project;

record ParlanceJson(string Name, IEnumerable<SubprojectDefinition> Subprojects);

public class ParlanceProject : IParlanceProject
{
    private readonly Database.Models.Project _project;

    private static readonly JsonSerializerOptions Options = new()
    {
        PropertyNameCaseInsensitive = true
    };

    public ParlanceProject(Database.Models.Project project)
    {
        _project = project;
        using var file = File.OpenRead(Path.Combine(project.VcsDirectory, ".parlance.json"));
        var subprojectDefs = JsonSerializer.Deserialize<ParlanceJson>(file, Options);
        
        if (subprojectDefs is null)
        {
            throw new InvalidDataException("The Parlance project definition is invalid.");
        }

        Subprojects = subprojectDefs.Subprojects.Select(subproject => new ParlanceSubproject(this, subproject))
                                                .ToList()
                                                .AsReadOnly();
    }

    public string Name => _project.Name;
    public string VcsDirectory => _project.VcsDirectory;
    public IReadOnlyList<IParlanceSubproject> Subprojects { get; }

    public IParlanceSubproject SubprojectBySystemName(string systemName)
    {
        return Subprojects.FirstOrDefault(subproject => subproject.SystemName == systemName)
               ?? throw new SubprojectNotFoundException();
    }
}