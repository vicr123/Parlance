using JetBrains.Annotations;
using Parlance.Project;
using Parlance.Services.Projects;
using Parlance.Services.ProjectUpdater;
using Parlance.VersionControl.Services.VersionControl;
using Quartz;

namespace Parlance.Jobs;

[UsedImplicitly]
[DisallowConcurrentExecution]
public class ProjectCommitJob : IJob
{
    private readonly IProjectService _projectService;
    private readonly IProjectUpdateQueue _projectUpdateQueue;
    private readonly IVersionControlService _versionControlService;

    public ProjectCommitJob(IProjectService projectService, IVersionControlService versionControlService,
        IProjectUpdateQueue projectUpdateQueue)
    {
        _projectService = projectService;
        _versionControlService = versionControlService;
        _projectUpdateQueue = projectUpdateQueue;
    }

    public async Task Execute(IJobExecutionContext context)
    {
        try
        {
            foreach (var dbProject in await _projectService.Projects())
            {
                var project = dbProject.GetParlanceProject();
                if (_versionControlService.VersionControlStatus(project).ChangedFiles.Any())
                    await _versionControlService.SaveChangesToVersionControl(project);

                await _projectUpdateQueue.Queue(project);
            }
        }
        catch (Exception e)
        {
            Console.WriteLine(e.ToString());
        }
    }
}