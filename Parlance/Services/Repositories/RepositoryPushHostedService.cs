using Parlance.Services.Projects;

namespace Parlance.Services.Repositories;

public sealed class RepositoryPushHostedService(
    ILogger<RepositoryPushHostedService> logger,
    IProjectService projectService)
    : IHostedService, IDisposable
{
    private readonly ILogger<RepositoryPushHostedService> _logger = logger;
    private Timer? _timer = null;

    public Task StartAsync(CancellationToken stoppingToken)
    {
        _timer = new Timer(_ => _ = PushRepositories(), null, TimeSpan.Zero, TimeSpan.FromHours(1));
        return Task.CompletedTask;
    }

    private async Task PushRepositories()
    {
        var projects = await projectService.Projects();
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
