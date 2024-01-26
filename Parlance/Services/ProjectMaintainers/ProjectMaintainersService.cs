using Parlance.Database;
using Parlance.Database.Models;
using Parlance.Services.Superuser;
using Parlance.Vicr123Accounts.Services;

namespace Parlance.Services.ProjectMaintainers;

public class ProjectMaintainersService(
    ParlanceContext dbContext,
    IVicr123AccountsService accountsService,
    ISuperuserService superuserService)
    : IProjectMaintainersService
{
    public async Task AddProjectMaintainer(string user, Database.Models.Project? project)
    {
        dbContext.ProjectMaintainers.Add(new ProjectMaintainer
        {
            Project = project,
            UserId = (await accountsService.UserByUsername(user)).Id
        });

        await dbContext.SaveChangesAsync();
    }

    public async Task RemoveProjectMaintainer(string user, Database.Models.Project? project)
    {
        var userId = (await accountsService.UserByUsername(user)).Id;

        var maintainer = dbContext.ProjectMaintainers.Single(maintainer =>
            maintainer.Project == project && maintainer.UserId == userId);

        dbContext.ProjectMaintainers.Remove(maintainer);
        await dbContext.SaveChangesAsync();
    }

    public async IAsyncEnumerable<string> ProjectMaintainers(Database.Models.Project? project)
    {
        var maintainers = dbContext.ProjectMaintainers
            .Where(maintainer => maintainer.Project == project);

        foreach (var maintainer in maintainers)
        {
            var user = await accountsService.UserById(maintainer.UserId);
            yield return user.Username;
        }
    }

    public async Task<bool> IsProjectMaintainer(string? user, Database.Models.Project project)
    {
        if (user is null) return false;

        if (await superuserService.IsSuperuser(user)) return true;

        var userId = (await accountsService.UserByUsername(user)).Id;
        return dbContext.ProjectMaintainers.Any(maintainer =>
            maintainer.UserId == userId && maintainer.Project == project);
    }
}