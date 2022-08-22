using System.Text.Json;

namespace Parlance.Project;

record ParlanceJson(string Name, IEnumerable<ParlanceSubproject.SubprojectDefinition> Subprojects);

public class ParlanceProject : IParlanceProject
{
    private readonly Database.Models.Project _project;

    public ParlanceProject(Database.Models.Project project)
    {
        _project = project;
        var subprojectDefs =
            JsonSerializer.Deserialize<ParlanceJson>(File.OpenRead(Path.Combine(project.VcsDirectory,
                ".parlance.json")), new JsonSerializerOptions()
            {
                PropertyNameCaseInsensitive = true
            });

        Subprojects = subprojectDefs.Subprojects.Select(subproject => new ParlanceSubproject(this, subproject));
    }

    public string VcsDirectory => _project.VcsDirectory;
    public IEnumerable<IParlanceSubproject> Subprojects { get; }
    
    public IParlanceSubproject SubprojectBySystemName(string systemName)
    {
        try
        {
            return Subprojects.First(subproject => subproject.SystemName == systemName);
        }
        catch (InvalidOperationException)
        {
            throw new SubprojectNotFoundException();
        }
    }
}