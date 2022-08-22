using System.Text.Json;

namespace Parlance.Project;

record ParlanceJson(string Name, IEnumerable<ParlanceSubproject.SubprojectDefinition> Subprojects);

public class ParlanceProject : IParlanceProject
{
    
    public ParlanceProject(Database.Models.Project project)
    {
        var subprojectDefs =
            JsonSerializer.Deserialize<ParlanceJson>(File.OpenRead(Path.Combine(project.VcsDirectory,
                ".parlance.json")), new JsonSerializerOptions()
            {
                PropertyNameCaseInsensitive = true
            });

        Subprojects = subprojectDefs.Subprojects.Select(subproject => new ParlanceSubproject(this, subproject));
    }

    public IEnumerable<IParlanceSubproject> Subprojects { get; }
    
    public IParlanceSubproject SubprojectBySystemName(string systemName)
    {
        return Subprojects.First(subproject => subproject.SystemName == systemName);
    }
}