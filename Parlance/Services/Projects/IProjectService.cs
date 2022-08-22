using Parlance.Database.Models;

namespace Parlance.Services.Projects;

public class ProjectNotFoundException : InvalidOperationException
{
    
}

public interface IProjectService
{
    public Task RegisterProject(string cloneUrl, string branch, string name);
    public Task<IEnumerable<Database.Models.Project>> Projects();
    public Task<Database.Models.Project> ProjectBySystemName(string systemName);
    public Task RemoveProject(Database.Models.Project project);
}