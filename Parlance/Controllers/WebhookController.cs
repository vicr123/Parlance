using Microsoft.AspNetCore.Mvc;
using Parlance.Project;
using Parlance.Services.Projects;
using Parlance.Services.ProjectUpdater;
using Parlance.VersionControl.Services.VersionControl;

namespace Parlance.Controllers;

[ApiController]
[Route("api/[controller]")]
public class WebhookController : Controller
{
    private readonly IProjectService _projectService;
    private readonly IProjectUpdateQueue _updateQueue;
    private readonly IVersionControlService _versionControlService;

    public WebhookController(IProjectService projectService, IVersionControlService versionControlService,
        IProjectUpdateQueue updateQueue)
    {
        _projectService = projectService;
        _versionControlService = versionControlService;
        _updateQueue = updateQueue;
    }

    [HttpPost]
    [Route("github")]
    public async Task<IActionResult> ExecuteGitHubWebhook([FromBody] ExecuteGitHubWebhookRequestData data)
    {
        if (!Request.Headers["X-GitHub-Event"].Contains("push")) return NoContent();

        var projects = await _projectService.Projects();
        var hitProjects = projects.Select(x => x.GetParlanceProject()).Where(x =>
            string.Equals(_versionControlService.CloneUrl(x), data.Repository.Clone_Url,
                StringComparison.InvariantCultureIgnoreCase) ||
            string.Equals(_versionControlService.CloneUrl(x), data.Repository.Ssh_Url,
                StringComparison.InvariantCultureIgnoreCase));

        foreach (var project in hitProjects)
            await _updateQueue.Queue(project);

        return NoContent();
    }

    public class ExecuteGitHubWebhookRequestData
    {
        public GitHubWebHookRepository Repository { get; set; } = null!;

        public class GitHubWebHookRepository
        {
            public string Ssh_Url { get; set; } = null!;
            public string Clone_Url { get; set; } = null!;
        }
    }
}