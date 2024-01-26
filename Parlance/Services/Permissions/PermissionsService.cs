using Microsoft.EntityFrameworkCore;
using Npgsql;
using Parlance.CldrData;
using Parlance.Database;
using Parlance.Database.Models;
using Parlance.Services.ProjectMaintainers;
using Parlance.Services.Projects;
using Parlance.Services.Superuser;
using Parlance.Vicr123Accounts.Services;

namespace Parlance.Services.Permissions;

public class PermissionsService(
    ParlanceContext dbContext,
    ISuperuserService superuserService,
    IVicr123AccountsService accountsService,
    IProjectMaintainersService projectMaintainersService,
    IProjectService projectService)
    : IPermissionsService
{
    private const string LocalePermissionType = "locale";

    public async Task GrantLocalePermission(string user, Locale locale)
    {
        try
        {
            dbContext.Permissions.Add(new Permission
            {
                UserId = (await accountsService.UserByUsername(user)).Id,
                PermissionType = LocalePermissionType,
                SpecificPermission = locale.ToDashed()
            });

            await dbContext.SaveChangesAsync();
        }
        catch (DbUpdateException ex) when (ex.InnerException is PostgresException
                                           {
                                               SqlState: PostgresErrorCodes.UniqueViolation
                                           })
        {
            throw new InvalidOperationException();
        }
    }

    public async Task RevokeLocalePermission(string user, Locale locale)
    {
        var userId = (await accountsService.UserByUsername(user)).Id;

        var permission = dbContext.Permissions.Single(permission =>
            permission.UserId == userId && permission.PermissionType == LocalePermissionType &&
            permission.SpecificPermission == locale.ToDashed());

        dbContext.Permissions.Remove(permission);
        await dbContext.SaveChangesAsync();
    }

    public async Task<bool> HasLocalePermission(string? user, Locale locale)
    {
        if (user is null) return false;
        var userId = (await accountsService.UserByUsername(user)).Id;

        return dbContext.Permissions.Any(permission =>
            permission.UserId == userId && permission.PermissionType == LocalePermissionType &&
            permission.SpecificPermission == locale.ToDashed());
    }

    public async IAsyncEnumerable<string> LocalePermissions(Locale locale)
    {
        var permissions = dbContext.Permissions
            .Where(permission => permission.PermissionType == LocalePermissionType &&
                                 permission.SpecificPermission == locale.ToDashed());

        foreach (var permission in permissions)
        {
            var user = await accountsService.UserById(permission.UserId);
            yield return user.Username;
        }
    }

    public async Task<bool> CanEditProjectLocale(string? user, string project, Locale locale)
    {
        if (user is null) return false;
        if (await superuserService.IsSuperuser(user)) return true;

        var p = await projectService.ProjectBySystemName(project);
        if (await projectMaintainersService.IsProjectMaintainer(user, p)) return true;
        if (await HasLocalePermission(user, locale)) return true;
        return false;
    }

    public Task<bool> HasManageProjectPermission(string? user, string project)
    {
        if (user is null) return Task.FromResult(false);
        return Task.FromResult(true);
    }

    public async IAsyncEnumerable<Locale> UserPermissions(string? user)
    {
        if (user is null) yield break;
        var userId = (await accountsService.UserByUsername(user)).Id;

        var permissions = dbContext.Permissions.Where(permission =>
            permission.PermissionType == LocalePermissionType && permission.UserId == userId);

        foreach (var permission in permissions) yield return permission.SpecificPermission.ToLocale();
    }
}