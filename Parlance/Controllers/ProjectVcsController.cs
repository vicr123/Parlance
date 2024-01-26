using LibGit2Sharp;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Parlance.Helpers;
using Parlance.Project;
using Parlance.Project.Exceptions;
using Parlance.Project.Index;
using Parlance.Services.Projects;
using Parlance.VersionControl.Services.VersionControl;

namespace Parlance.Controllers;

[ApiController]
[Route("api/projects/{project}")]
[EnableRateLimiting("limiter")]
public class ProjectVcsController(
    IProjectService projectService,
    IVersionControlService versionControlService,
    IParlanceIndexingService indexingService)
    : Controller
{
    [HttpGet]
    [Authorize(Policy = "ProjectManager")]
    [Route("vcs")]
    public async Task<IActionResult> GetVcsDetails(string project)
    {
        try
        {
            var p = await projectService.ProjectBySystemName(project);
            return Json(versionControlService.VersionControlStatus(p));
        }
        catch (ProjectNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpPost]
    [Authorize(Policy = "ProjectManager")]
    [Route("vcs/fetch")]
    public async Task<IActionResult> FetchFromVcs(string project)
    {
        try
        {
            var p = await projectService.ProjectBySystemName(project);
            await versionControlService.UpdateVersionControlMetadata(p);

            return NoContent();
        }
        catch (LibGit2SharpException ex)
        {
            return this.ClientError(ParlanceClientError.GitError, ex.Message);
        }
        catch (ProjectNotFoundException)
        {
            return NotFound();
        }
    }


    [HttpPost]
    [Authorize(Policy = "ProjectManager")]
    [Route("vcs/pull")]
    public async Task<IActionResult> PullFromVcs(string project)
    {
        try
        {
            var p = await projectService.ProjectBySystemName(project);

            await versionControlService.UpdateVersionControlMetadata(p);
            await versionControlService.ReconcileRemoteWithLocal(p);

            try
            {
                var proj = p.GetParlanceProject();
                await indexingService.IndexProject(proj);
            }
            catch (ParlanceJsonFileParseException)
            {
                // ignored                
            }

            return NoContent();
        }
        catch (MergeConflictException)
        {
            return this.ClientError(ParlanceClientError.MergeConflict);
        }
        catch (DirtyWorkingTreeException)
        {
            return this.ClientError(ParlanceClientError.DirtyWorkingTree);
        }
        catch (LibGit2SharpException ex)
        {
            return this.ClientError(ParlanceClientError.GitError, ex.Message);
        }
        catch (ProjectNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpPost]
    [Authorize(Policy = "ProjectManager")]
    [Route("vcs/push")]
    public async Task<IActionResult> PushProjectToVcs(string project)
    {
        try
        {
            var p = await projectService.ProjectBySystemName(project);
            await versionControlService.PublishSavedChangesToSource(p);

            return NoContent();
        }
        catch (NonFastForwardException)
        {
            return this.ClientError(ParlanceClientError.NonFastForwardableError);
        }
        catch (LibGit2SharpException ex)
        {
            return this.ClientError(ParlanceClientError.GitError, ex.Message);
        }
        catch (ProjectNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpPost]
    [Authorize(Policy = "ProjectManager")]
    [Route("vcs/commit")]
    public async Task<IActionResult> CommitProjectToVcs(string project)
    {
        try
        {
            var p = await projectService.ProjectBySystemName(project);
            var commit = await versionControlService.SaveChangesToVersionControl(p);
            if (commit is null) return BadRequest();

            return Json(commit);
        }
        catch (LibGit2SharpException ex)
        {
            return this.ClientError(ParlanceClientError.GitError, ex.Message);
        }
        catch (ProjectNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpDelete]
    [Authorize(Policy = "ProjectManager")]
    [Route("vcs/uncommitted")]
    public async Task<IActionResult> DeleteUncommitedFromVcs(string project)
    {
        try
        {
            var p = await projectService.ProjectBySystemName(project);
            await versionControlService.DeleteUnpublishedChanges(p);

            return NoContent();
        }
        catch (LibGit2SharpException ex)
        {
            return this.ClientError(ParlanceClientError.GitError, ex.Message);
        }
        catch (ProjectNotFoundException)
        {
            return NotFound();
        }
    }

}