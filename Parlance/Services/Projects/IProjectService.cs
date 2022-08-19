using Parlance.Database.Models;

namespace Parlance.Services.Projects;

public interface IProjectService
{
    public Task RegisterProject(string cloneUrl, string branch, string name);
    public Task<IEnumerable<Project>> Projects();
    public Task<Project> ProjectBySystemName(string systemName);
    public Task RemoveProject(Project project);
}