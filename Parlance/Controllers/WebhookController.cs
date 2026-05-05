using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Parlance.Database;
using Parlance.Database.Models;
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
    IProjectUpdateQueue updateQueue,
    ParlanceContext dbContext)
    : Controller
{
    [HttpPost]
    [Route("github")]
    public async Task<IActionResult> ExecuteGitHubWebhook([FromBody] ExecuteGitHubWebhookRequestData data)
    {
        return await ExecuteGithubCompatibleWebhook(data, "github");
    }
    
    [HttpPost]
    [Route("forgejo")]
    public async Task<IActionResult> ExecuteForgejoWebhook([FromBody] ExecuteGitHubWebhookRequestData data)
    {
        return await ExecuteGithubCompatibleWebhook(data, "forgejo");
    }

    private async Task<IActionResult> ExecuteGithubCompatibleWebhook(ExecuteGitHubWebhookRequestData data, string source)
    {
        if (!Request.Headers["X-GitHub-Event"].Contains("push")) return NoContent();

        if (data.Repository.Clone_Url.StartsWith("https://github.com"))
        {
            // This comes from GitHub so ignore the source
            source = "github";
        }
        else if (data.Repository.Clone_Url.StartsWith("https://codeberg.org"))
        {
            // This comes from Codeberg so ignore the source
            source = "codeberg";
        }

        var deliveryId = Request.Headers["X-GitHub-Delivery"].FirstOrDefault() ?? source;

        var projects = await projectService.Projects();
        var hitProjects = projects.Where(x =>
            string.Equals(versionControlService.CloneUrl(x), data.Repository.Clone_Url,
                StringComparison.InvariantCultureIgnoreCase) ||
            string.Equals(versionControlService.CloneUrl(x), data.Repository.Ssh_Url,
                StringComparison.InvariantCultureIgnoreCase));

        var updatedProjects = new List<Database.Models.Project>();
        
        foreach (var project in hitProjects)
        {
            if (project.Branches.Count == 0)
            {
                await updateQueue.Queue(project);
                updatedProjects.Add(project);
                
                dbContext.RemoveRange(
                    dbContext.WebhookExecutions.Where(e => e.Parent.Id == project.Id)
                );
                await dbContext.WebhookExecutions.AddAsync(new WebhookExecution
                {
                    Parent = project,
                    Payload = deliveryId,
                    ReceivedAt = DateTimeOffset.Now,
                    Source = source
                });
            }
            else
            {
                foreach (var branch in project.Branches.Where(branch => data.Ref.Contains(branch.BranchName)))
                {
                    await updateQueue.Queue(branch);
                    updatedProjects.Add(project);
                    
                    dbContext.RemoveRange(
                        dbContext.WebhookExecutions.Where(e => e.Parent.Id == project.Id)
                    );
                    await dbContext.WebhookExecutions.AddAsync(new WebhookExecution
                    {
                        Parent = project,
                        Payload = deliveryId,
                        ReceivedAt = DateTimeOffset.Now,
                        Source = source
                    });
                }
            }
        }

        await dbContext.SaveChangesAsync();

        return Json(new
        {
            UpdatedProjects = updatedProjects.Select(project => project.Name)
        });
    }

    public class ExecuteGitHubWebhookRequestData
    {
        public string Ref { get; set; } = null!;
        public GitHubWebHookRepository Repository { get; set; } = null!;

        public class GitHubWebHookRepository
        {
            public string Ssh_Url { get; set; } = null!;
            public string Clone_Url { get; set; } = null!;
        }
    }
}