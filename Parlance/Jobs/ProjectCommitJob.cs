using JetBrains.Annotations;
using Parlance.Project.Exceptions;
using Parlance.Services.Projects;
using Parlance.Services.ProjectUpdater;
using Parlance.VersionControl.Services.VersionControl;
using Quartz;

namespace Parlance.Jobs;

[UsedImplicitly]
[DisallowConcurrentExecution]
public class ProjectCommitJob(
    IProjectService projectService,
    IVersionControlService versionControlService,
    IProjectUpdateQueue projectUpdateQueue)
    : IJob
{
    public async Task Execute(IJobExecutionContext context)
    {
        try
        {
            foreach (var project in await projectService.Projects())
            {
                try
                {
                    if (versionControlService.VersionControlStatus(project).ChangedFiles.Any())
                        await versionControlService.SaveChangesToVersionControl(project);

                    await projectUpdateQueue.Queue(project);
                }
                catch (ParlanceJsonFileParseException)
                {
                    // ignored
                }
            }
        }
        catch (Exception e)
        {
            Console.WriteLine(e.ToString());
        }
    }
}