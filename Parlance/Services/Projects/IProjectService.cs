using Parlance.Database.Interfaces;

namespace Parlance.Services.Projects;

public class ProjectNotFoundException : InvalidOperationException;

public class DuplicateResourceException : InvalidOperationException;

public interface IProjectService
{
    public Task RegisterProject(string cloneUrl, string branch, string name);
    public Task UpgradeProject(Database.Models.Project project);
    public Task CloneBranch(Database.Models.Project project, string branch);
    public Task DeleteBranch(Database.Models.ProjectBranch projectBranch);
    public Task<IEnumerable<Database.Models.Project>> Projects();
    public Task<IVcsable> ProjectBySystemName(string systemName);
    public Task RemoveProject(Database.Models.Project project);
}