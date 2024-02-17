using Parlance.Services.Projects;

namespace Parlance.UnitTest;

public class UnitTest1 : IClassFixture<DatabaseFixture>
{
    private DatabaseFixture _fixture;

    public UnitTest1(DatabaseFixture fixture)
    {
        _fixture = fixture;
    }
    
    [Fact]
    public void TestProjects()
    {
        var projectService = new ProjectService();
    }
}