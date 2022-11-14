namespace Parlance.Services.ProjectMaintainers;

public interface IProjectMaintainersService
{
    public Task AddProjectMaintainer(string user, Database.Models.Project? project);
    public Task RemoveProjectMaintainer(string user, Database.Models.Project? project);
    public IAsyncEnumerable<string> ProjectMaintainers(Database.Models.Project? project);
}