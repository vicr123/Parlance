using Microsoft.EntityFrameworkCore;
using Npgsql;
using Parlance.CldrData;
using Parlance.Database;
using Parlance.Database.Models;
using Parlance.Services.Superuser;
using Parlance.Vicr123Accounts.Services;

namespace Parlance.Services.Permissions;

public class PermissionsService : IPermissionsService
{
    private const string LocalePermissionType = "locale";
    
    private readonly ParlanceContext _dbContext;
    private readonly ISuperuserService _superuserService;
    private readonly IVicr123AccountsService _accountsService;

    public PermissionsService(ParlanceContext dbContext, ISuperuserService superuserService, IVicr123AccountsService accountsService)
    {
        _dbContext = dbContext;
        _superuserService = superuserService;
        _accountsService = accountsService;
    }

    public async Task GrantLocalePermission(string user, Locale locale)
    {
        try
        {
            _dbContext.Permissions.Add(new Permission
            {
                UserId = (await _accountsService.UserByUsername(user)).Id,
                PermissionType = LocalePermissionType,
                SpecificPermission = locale.ToDashed()
            });

            await _dbContext.SaveChangesAsync();
        }
        catch (DbUpdateException ex) when (ex.InnerException is PostgresException { SqlState: PostgresErrorCodes.UniqueViolation })
        {
            throw new InvalidOperationException();
        }
    }

    public async Task RevokeLocalePermission(string user, Locale locale)
    {
        var userId = (await _accountsService.UserByUsername(user)).Id;
        
        var permission = _dbContext.Permissions.Single(permission =>
            permission.UserId == userId && permission.PermissionType == LocalePermissionType &&
            permission.SpecificPermission == locale.ToDashed());

        _dbContext.Permissions.Remove(permission);
        await _dbContext.SaveChangesAsync();
    }

    public async Task<bool> HasLocalePermission(string? user, Locale locale)
    {
        if (user is null) return false;
        var userId = (await _accountsService.UserByUsername(user)).Id;

        return _dbContext.Permissions.Any(permission =>
            permission.UserId == userId && permission.PermissionType == LocalePermissionType &&
            permission.SpecificPermission == locale.ToDashed());
    }

    public async IAsyncEnumerable<string> LocalePermissions(Locale locale)
    {
        var permissions = _dbContext.Permissions
            .Where(permission => permission.PermissionType == LocalePermissionType &&
                                 permission.SpecificPermission == locale.ToDashed());

        foreach (var permission in permissions)
        {
            var user = await _accountsService.UserById(permission.UserId);
            yield return user.Username;
        }
    }

    public async Task<bool> CanEditProjectLocale(string? user, string project, Locale locale)
    {
        if (user is null) return false;
        if (await _superuserService.IsSuperuser(user)) return true;
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
        var userId = (await _accountsService.UserByUsername(user)).Id;

        var permissions = _dbContext.Permissions.Where(permission =>
            permission.PermissionType == LocalePermissionType && permission.UserId == userId);

        foreach (var permission in permissions)
        {
            yield return permission.SpecificPermission.ToLocale();
        }
    }
}