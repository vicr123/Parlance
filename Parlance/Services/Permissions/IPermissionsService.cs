using Parlance.CLDR;

namespace Parlance.Services.Permissions;

public interface IPermissionsService
{
    public Task GrantLocalePermission(string user, Locale locale);
    public Task RevokeLocalePermission(string user, Locale locale);
    public Task<bool> HasLocalePermission(string user, Locale locale);
    public Task<bool> CanEditProjectLocale(string? user, string project, Locale locale);
}