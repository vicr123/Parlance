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

    private readonly Database.Models.Project _project;

    public ParlanceProject(Database.Models.Project project, string branch)
    {
        _project = project;
        using var file = File.OpenRead(Path.Combine(project.VcsDirectory, ".parlance.json"));

        try
        {
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
    }

    public string ReadableName { get; }

    public string Name => _project.Name;
    public string VcsDirectory => _project.VcsDirectory;
    public DateTime? Deadline { get; }
    public IReadOnlyList<IParlanceSubproject> Subprojects { get; }

    public IParlanceSubproject SubprojectBySystemName(string systemName)
    {
        return Subprojects.FirstOrDefault(subproject => subproject.SystemName == systemName)
               ?? throw new SubprojectNotFoundException();
    }
}