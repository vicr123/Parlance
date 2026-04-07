using System.Text.Json;
using Parlance.Project.Exceptions;

namespace Parlance.Project;

internal record ParlanceJson(string Name, IEnumerable<SubprojectDefinition> Subprojects, ulong? Deadline);

public class ParlanceProject : IParlanceProject
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };
    
    public static ParlanceProject CreateParlanceProject(Database.Models.Project project)
    {
        if (project.SystemName is null)
        {
            throw new InvalidOperationException("Tried to construct Parlance project without a branch");
        }
        
        var vcsDirectory = project.VcsDirectory!;
        return new ParlanceProject(project.Name, project.SystemName, vcsDirectory);
    }

    public static ParlanceProject CreateParlanceProject(Database.Models.ProjectBranch projectBranch)
    {
        return new ParlanceProject(projectBranch.Parent.Name, projectBranch.SystemName, projectBranch.VcsDirectory);
    }

    private ParlanceProject(string projectName, string systemName, string vcsDirectory)
    {
        try
        {
            Name = projectName;
            SystemName = systemName;
            VcsDirectory = vcsDirectory;
            
            using var file = File.OpenRead(Path.Combine(vcsDirectory, ".parlance.json"));
            
            var subprojectDefs = JsonSerializer.Deserialize<ParlanceJson>(file, JsonOptions);

            if (subprojectDefs is null)
                throw new ParlanceJsonFileParseException("The Parlance project definition is invalid.");

            ReadableName = subprojectDefs.Name;
            Subprojects = subprojectDefs.Subprojects.Select(subproject => new ParlanceSubproject(this, subproject))
                .ToList()
                .AsReadOnly();

            if (subprojectDefs.Deadline.HasValue)
                Deadline = DateTime.UnixEpoch.AddMilliseconds(subprojectDefs.Deadline.Value);
        }
        catch (JsonException ex)
        {
            throw new ParlanceJsonFileParseException("The Parlance project definition is invalid.", ex);
        }
        catch (DirectoryNotFoundException ex)
        {
            throw new ParlanceJsonFileParseException("Unable to find the .parlance.json file.", ex);
        }
        catch (FileNotFoundException ex)
        {
            throw new ParlanceJsonFileParseException("Unable to find the .parlance.json file.", ex);
        }
    }

    public string ReadableName { get; }

    public string SystemName { get; }

    public string Name { get; }
    public string VcsDirectory { get; }
    public DateTime? Deadline { get; }
    public IReadOnlyList<IParlanceSubproject> Subprojects { get; }

    public IParlanceSubproject SubprojectBySystemName(string systemName)
    {
        return Subprojects.FirstOrDefault(subproject => subproject.SystemName == systemName)
               ?? throw new SubprojectNotFoundException();
    }
}