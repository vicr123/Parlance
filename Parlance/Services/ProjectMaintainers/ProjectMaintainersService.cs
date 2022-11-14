using Parlance.Database;
using Parlance.Database.Models;
using Parlance.Vicr123Accounts.Services;

namespace Parlance.Services.ProjectMaintainers;

public class ProjectMaintainersService : IProjectMaintainersService
{
    private readonly IVicr123AccountsService _accountsService;
    private readonly ParlanceContext _dbContext;

    public ProjectMaintainersService(ParlanceContext dbContext, IVicr123AccountsService accountsService)
    {
        _dbContext = dbContext;
        _accountsService = accountsService;
    }

    public async Task AddProjectMaintainer(string user, Database.Models.Project? project)
    {
        _dbContext.ProjectMaintainers.Add(new ProjectMaintainer
        {
            Project = project,
            UserId = (await _accountsService.UserByUsername(user)).Id
        });

        await _dbContext.SaveChangesAsync();
    }

    public async Task RemoveProjectMaintainer(string user, Database.Models.Project? project)
    {
        var userId = (await _accountsService.UserByUsername(user)).Id;

        var maintainer = _dbContext.ProjectMaintainers.Single(maintainer =>
            maintainer.Project == project && maintainer.UserId == userId);

        _dbContext.ProjectMaintainers.Remove(maintainer);
        await _dbContext.SaveChangesAsync();
    }

    public async IAsyncEnumerable<string> ProjectMaintainers(Database.Models.Project? project)
    {
        var maintainers = _dbContext.ProjectMaintainers
            .Where(maintainer => maintainer.Project == project);

        foreach (var maintainer in maintainers)
        {
            var user = await _accountsService.UserById(maintainer.UserId);
            yield return user.Username;
        }
    }
}