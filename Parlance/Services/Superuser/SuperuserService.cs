using Parlance.Database;

namespace Parlance.Services.Superuser;

public class SuperuserService(ParlanceContext dbContext) : ISuperuserService
{
    public Task<bool> IsSuperuser(string username)
    {
        return Task.FromResult(username == "parlance" || dbContext.Superusers.Any(x => x.Username == username));
    }

    public async Task GrantSuperuserPermissions(string username)
    {
        dbContext.Superusers.Add(new Database.Models.Superuser
        {
            Username = username
        });
        
        await dbContext.SaveChangesAsync();
    }

    public async Task RevokeSuperuserPermissions(string username)
    {
        dbContext.Superusers.Remove(dbContext.Superusers.First(x => x.Username == username));

        await dbContext.SaveChangesAsync();
    }

    public Task<IEnumerable<string>> Superusers()
    {
        return Task.FromResult<IEnumerable<string>>(dbContext.Superusers.Select(x => x.Username));
    }
}