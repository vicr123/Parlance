using Parlance.Database;
using Parlance.Models;

namespace Parlance.Services;

public class SuperuserService : ISuperuserService
{
    private readonly ParlanceContext _dbContext;

    public SuperuserService(ParlanceContext dbContext)
    {
        _dbContext = dbContext;
    }

    public Task<bool> IsSuperuser(string username)
    {
        return Task.FromResult(username == "parlance" || _dbContext.Superusers.Any(x => x.Username == username));
    }

    public async Task GrantSuperuserPermissions(string username)
    {
        _dbContext.Superusers.Add(new Superuser
        {
            Username = username
        });
        
        await _dbContext.SaveChangesAsync();
    }

    public async Task RevokeSuperuserPermissions(string username)
    {
        _dbContext.Superusers.Remove(_dbContext.Superusers.First(x => x.Username == username));

        await _dbContext.SaveChangesAsync();
    }

    public Task<IEnumerable<string>> Superusers()
    {
        return Task.FromResult<IEnumerable<string>>(_dbContext.Superusers.Select(x => x.Username));
    }
}