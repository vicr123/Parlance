using Parlance.CldrData;

namespace Parlance.Services.Permissions;

public interface IPermissionsService
{
    public Task GrantLocalePermission(string user, Locale locale);
    public Task RevokeLocalePermission(string user, Locale locale);
    public Task<bool> HasLocalePermission(string? user, Locale locale);
    public IAsyncEnumerable<string> LocalePermissions(Locale locale);
    public Task<bool> CanEditProjectLocale(string? user, string project, Locale locale);
    public Task<bool> HasManageProjectPermission(string? user, string project);
}