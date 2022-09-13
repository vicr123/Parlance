using LibGit2Sharp;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Parlance.Helpers;
using Parlance.Project;
using Parlance.Services.Projects;
using Parlance.VersionControl.Services.VersionControl;

namespace Parlance.Controllers;

[ApiController]
[Route("api/projects/{project}")]
public class ProjectVcsController : Controller
{
    private readonly IProjectService _projectService;
    private readonly IVersionControlService _versionControlService;

    public ProjectVcsController(IProjectService projectService, IVersionControlService versionControlService)
    {
        _projectService = projectService;
        _versionControlService = versionControlService;
    }

    [HttpGet]
    [Authorize(Policy = "ProjectManager")]
    [Route("vcs")]
    public async Task<IActionResult> GetVcsDetails(string project)
    {
        try
        {
            var p = await _projectService.ProjectBySystemName(project);
            var proj = p.GetParlanceProject();
            return Json(_versionControlService.VersionControlStatus(proj));
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
            var p = await _projectService.ProjectBySystemName(project);
            var proj = p.GetParlanceProject();

            await _versionControlService.UpdateVersionControlMetadata(proj);

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
            var p = await _projectService.ProjectBySystemName(project);
            var proj = p.GetParlanceProject();

            await _versionControlService.ReconcileRemoteWithLocal(proj);

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
            var p = await _projectService.ProjectBySystemName(project);
            var proj = p.GetParlanceProject();

            await _versionControlService.PublishSavedChangesToSource(proj);

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
            var p = await _projectService.ProjectBySystemName(project);
            var proj = p.GetParlanceProject();

            var commit = await _versionControlService.SaveChangesToVersionControl(proj);
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
}