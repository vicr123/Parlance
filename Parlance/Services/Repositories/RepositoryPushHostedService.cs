using Parlance.Services.Projects;

namespace Parlance.Services.Repositories;

public sealed class RepositoryPushHostedService : IHostedService, IDisposable
{
    private readonly ILogger<RepositoryPushHostedService> _logger;
    private readonly IProjectService _projectService;
    private Timer? _timer = null;

    public RepositoryPushHostedService(ILogger<RepositoryPushHostedService> logger, IProjectService projectService)
    {
        _logger = logger;
        _projectService = projectService;
    }

    public Task StartAsync(CancellationToken stoppingToken)
    {
        _timer = new Timer(_ => _ = PushRepositories(), null, TimeSpan.Zero, TimeSpan.FromHours(1));
        return Task.CompletedTask;
    }

    private async Task PushRepositories()
    {
        var projects = await _projectService.Projects();
        foreach (var project in projects)
        {
            //project.VcsDirectory
        }
    }

    public Task StopAsync(CancellationToken stoppingToken)
    {
        _timer?.Change(Timeout.Infinite, 0);
        return Task.CompletedTask;
    }

    public void Dispose()
    {
        _timer?.Dispose();
    }
}
