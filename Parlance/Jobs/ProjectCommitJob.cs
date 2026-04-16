using JetBrains.Annotations;
using Parlance.Database.Interfaces;
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
            List<IVcsable> vcsables = [];
            foreach (var project in await projectService.Projects())
            {
                if (project.Branches.Count == 0)
                {
                    vcsables.Add(project);
                }
                else
                {
                    vcsables.AddRange(project.Branches);
                }
            }

            foreach (var vcsable in vcsables)
            {
                try
                {
                    if (versionControlService.VersionControlStatus(vcsable).ChangedFiles.Any())
                        await versionControlService.SaveChangesToVersionControl(vcsable);

                    await projectUpdateQueue.Queue(vcsable);
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