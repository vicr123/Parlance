using Microsoft.EntityFrameworkCore;
using Npgsql;
using Parlance.CLDR;
using Parlance.Database;
using Parlance.Database.Models;
using Parlance.Services.Superuser;

namespace Parlance.Services.Permissions;

public class PermissionsService : IPermissionsService
{
    private const string LocalePermissionType = "locale";
    
    private readonly ParlanceContext _dbContext;
    private readonly ISuperuserService _superuserService;

    public PermissionsService(ParlanceContext dbContext, ISuperuserService superuserService)
    {
        _dbContext = dbContext;
        _superuserService = superuserService;
    }

    public async Task GrantLocalePermission(string user, Locale locale)
    {
        try
        {
            _dbContext.Permissions.Add(new Permission
            {
                Username = user,
                PermissionType = LocalePermissionType,
                SpecificPermission = locale.ToDashed()
            });

            await _dbContext.SaveChangesAsync();
        }
        catch (DbUpdateException ex)
        {
            if (ex.InnerException is PostgresException { SqlState: PostgresErrorCodes.UniqueViolation })
            {
                throw new InvalidOperationException();
            }

            throw;
        }
    }

    public async Task RevokeLocalePermission(string user, Locale locale)
    {
        var permission = _dbContext.Permissions.Single(permission =>
            permission.Username == user && permission.PermissionType == LocalePermissionType &&
            permission.SpecificPermission == locale.ToDashed());

        _dbContext.Permissions.Remove(permission);
        await _dbContext.SaveChangesAsync();
    }

    public Task<bool> HasLocalePermission(string user, Locale locale)
    {
        return Task.FromResult(_dbContext.Permissions.Any(permission =>
            permission.Username == user && permission.PermissionType == LocalePermissionType &&
            permission.SpecificPermission == locale.ToDashed()));
    }

    public async Task<bool> CanEditProjectLocale(string? user, string project, Locale locale)
    {
        if (user is null) return false;
        if (await _superuserService.IsSuperuser(user)) return true;
        if (await HasLocalePermission(user, locale)) return true;
        return false;
    }
}