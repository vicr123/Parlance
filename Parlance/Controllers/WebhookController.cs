using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Parlance.Services.Projects;
using Parlance.Services.ProjectUpdater;
using Parlance.VersionControl.Services.VersionControl;

namespace Parlance.Controllers;

[ApiController]
[Route("api/[controller]")]
[EnableRateLimiting("limiter")]
public class WebhookController(
    IProjectService projectService,
    IVersionControlService versionControlService,
    IProjectUpdateQueue updateQueue)
    : Controller
{
    [HttpPost]
    [Route("github")]
    public async Task<IActionResult> ExecuteGitHubWebhook([FromBody] ExecuteGitHubWebhookRequestData data)
    {
        if (!Request.Headers["X-GitHub-Event"].Contains("push")) return NoContent();

        var projects = await projectService.Projects();
        var hitProjects = projects.Where(x =>
            string.Equals(versionControlService.CloneUrl(x), data.Repository.Clone_Url,
                StringComparison.InvariantCultureIgnoreCase) ||
            string.Equals(versionControlService.CloneUrl(x), data.Repository.Ssh_Url,
                StringComparison.InvariantCultureIgnoreCase));

        foreach (var project in hitProjects)
            await updateQueue.Queue(project);

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