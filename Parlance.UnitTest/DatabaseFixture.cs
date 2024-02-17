using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Parlance.Database;

namespace Parlance.UnitTest;

public class DatabaseFixture : IDisposable
{
    private ServiceProvider _serviceProvider;
    private SqliteConnection _sqliteConnection;
    
    public DatabaseFixture()
    {
        _sqliteConnection = new SqliteConnection("Filename=:memory:");
        _sqliteConnection.Open();
        
        var serviceCollection = new ServiceCollection();
        serviceCollection.AddDbContext<ParlanceContext>(o => o.UseSqlite(_sqliteConnection));
        _serviceProvider = serviceCollection.BuildServiceProvider();

        Db = _serviceProvider.GetRequiredService<ParlanceContext>();
    }
    
    public void Dispose()
    {
        
    }
    
    public ParlanceContext Db { get; init; }
}