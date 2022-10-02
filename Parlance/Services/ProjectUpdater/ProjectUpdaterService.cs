using LibGit2Sharp;
using Parlance.Database;
using Parlance.Project.Index;
using Parlance.VersionControl.Services.VersionControl;

namespace Parlance.Services.ProjectUpdater;

public class ProjectUpdaterService : BackgroundService
{
    private readonly IProjectUpdateQueue _queue;
    private readonly IServiceScopeFactory _scopeFactory;

    public ProjectUpdaterService(IProjectUpdateQueue queue, IServiceScopeFactory scopeFactory)
    {
        _queue = queue;
        _scopeFactory = scopeFactory;
    }

    protected override async Task ExecuteAsync(CancellationToken cancellationToken)
    {
        await UpdateProjects(cancellationToken);
    }

    private async Task UpdateProjects(CancellationToken cancellationToken)
    {
        while (!cancellationToken.IsCancellationRequested)
        {
            var project = await _queue.Dequeue(cancellationToken);
            using var scope = _scopeFactory.CreateScope();
            await using var dbContext = scope.ServiceProvider.GetRequiredService<ParlanceContext>();
            var versionControlService = scope.ServiceProvider.GetRequiredService<IVersionControlService>();
            var indexingService = scope.ServiceProvider.GetRequiredService<IParlanceIndexingService>();

            try
            {
                await versionControlService.UpdateVersionControlMetadata(project);

                if (!versionControlService.VersionControlStatus(project).ChangedFiles.Any())
                {
                    await versionControlService.ReconcileRemoteWithLocal(project);
                    await indexingService.IndexProject(project);
                    await versionControlService.PublishSavedChangesToSource(project);
                }
            }
            catch (LibGit2SharpException)
            {
                //Log it somewhere!
            }
        }
    }
}