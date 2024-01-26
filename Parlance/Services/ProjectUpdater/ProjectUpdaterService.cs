using LibGit2Sharp;
using Parlance.Database;
using Parlance.Project;
using Parlance.Project.Exceptions;
using Parlance.Project.Index;
using Parlance.VersionControl.Services.VersionControl;

namespace Parlance.Services.ProjectUpdater;

public class ProjectUpdaterService(IProjectUpdateQueue queue, IServiceScopeFactory scopeFactory)
    : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken cancellationToken)
    {
        await UpdateProjects(cancellationToken);
    }

    private async Task UpdateProjects(CancellationToken cancellationToken)
    {
        while (!cancellationToken.IsCancellationRequested)
        {
            var project = await queue.Dequeue(cancellationToken);
            using var scope = scopeFactory.CreateScope();
            await using var dbContext = scope.ServiceProvider.GetRequiredService<ParlanceContext>();
            var versionControlService = scope.ServiceProvider.GetRequiredService<IVersionControlService>();
            var indexingService = scope.ServiceProvider.GetRequiredService<IParlanceIndexingService>();

            try
            {
                await versionControlService.UpdateVersionControlMetadata(project);

                if (!versionControlService.VersionControlStatus(project).ChangedFiles.Any())
                {
                    await versionControlService.ReconcileRemoteWithLocal(project);

                    try
                    {
                        var proj = project.GetParlanceProject();
                        await indexingService.IndexProject(proj);
                    }
                    catch (ParlanceJsonFileParseException)
                    {
                        // ignored
                    }

                    if (versionControlService.VersionControlStatus(project).Ahead > 0)
                        await versionControlService.PublishSavedChangesToSource(project);
                }
            }
            catch (MergeConflictException)
            {
                //Log it somewhere!
            }
            catch (LibGit2SharpException)
            {
                //Log it somewhere!
            }
        }
    }
}