namespace Parlance.Services;

public interface ISuperuserService
{
    public Task<bool> IsSuperuser(string username);
    public Task GrantSuperuserPermissions(string username);
    public Task RevokeSuperuserPermissions(string username);
    public Task<IEnumerable<string>> Superusers();
}