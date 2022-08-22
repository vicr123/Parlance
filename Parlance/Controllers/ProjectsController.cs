using LibGit2Sharp;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Parlance.Project;
using Parlance.Services.Projects;

namespace Parlance.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProjectsController : Controller
{
    private readonly IProjectService _projectService;

    public ProjectsController(IProjectService projectService)
    {
        _projectService = projectService;
    }

    [HttpGet]
    public async Task<IActionResult> GetProjects()
    {
        var projects = await _projectService.Projects();
        return Json(projects.Select(project => new
        {
            project.Name, project.SystemName
        }));
    }

    public class AddProjectRequestData
    {
        public string CloneUrl { get; set; }
        public string Name { get; set; }
        public string Branch { get; set; }
    }
    
    [Authorize(Policy = "Superuser")]
    [HttpPost]
    public async Task<IActionResult> AddProject([FromBody] AddProjectRequestData data)
    {
        try
        {
            await _projectService.RegisterProject(data.CloneUrl, data.Branch, data.Name);
            return NoContent();
        }
        catch (LibGit2SharpException ex)
        {
            return BadRequest(new
            {
                ex.Message
            });
        }
    }
    
    [Authorize(Policy = "Superuser")]
    [Route("{project}")]
    [HttpDelete]
    public async Task<IActionResult> RemoveProject(string project)
    {
        try
        {
            var p = await _projectService.ProjectBySystemName(project);
            await _projectService.RemoveProject(p);
            return NoContent();
        }
        catch (ProjectNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpGet]
    [Route("{project}")]
    public async Task<IActionResult> GetSubprojects(string project)
    {
        try
        {
            var p = await _projectService.ProjectBySystemName(project);
            var proj = p.GetParlanceProject();

            return Json(proj.Subprojects.Select(subproject => new
            {
                subproject.SystemName
            }));
        }
        catch (ProjectNotFoundException)
        {
            return NotFound();
        }
    }
}