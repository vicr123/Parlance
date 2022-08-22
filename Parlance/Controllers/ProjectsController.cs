using System.Globalization;
using LibGit2Sharp;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Primitives;
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

    [HttpGet]
    [Route("{project}/{subproject}")]
    public async Task<IActionResult> GetSubprojectLanguages(string project, string subproject)
    {
        try
        {
            var p = await _projectService.ProjectBySystemName(project);
            var subproj = p.GetParlanceProject().SubprojectBySystemName(subproject);

            return Json(subproj.AvailableLanguages().Select(lang => new
            {
                Language = lang,
                LanguageName = new CultureInfo(lang.Replace("_", "-")).DisplayName
            }));
        }
        catch (SubprojectNotFoundException)
        {
            return NotFound();
        }
        catch (ProjectNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpGet]
    [Route("{project}/{subproject}/{language}/entries")]
    public async Task<IActionResult> GetProjectEntries(string project, string subproject, string language)
    {
        try
        {
            var p = await _projectService.ProjectBySystemName(project);
            var translationFile = p.GetParlanceProject().SubprojectBySystemName(subproject).Language(language).TranslationFile;
            if (translationFile is null) return NotFound();

            Response.Headers.ETag = new StringValues(translationFile.Hash);

            return Json(translationFile.Entries.Select(entry => new
            {
                entry.Key, entry.Context, entry.Source, entry.Translation, entry.RequiresPluralisation
            }));
        }
        catch (SubprojectNotFoundException)
        {
            return NotFound();
        }
        catch (ProjectNotFoundException)
        {
            return NotFound();
        }
    }
    
    [HttpGet]
    [Route("{project}/{subproject}/{language}/entries/{key}")]
    public async Task<IActionResult> GetProjectEntryByIndex(string project, string subproject, string language, string key)
    {
        try
        {
            var p = await _projectService.ProjectBySystemName(project);
            var translationFile = p.GetParlanceProject().SubprojectBySystemName(subproject).Language(language)
                .TranslationFile;
            if (translationFile is null) return NotFound();

            Response.Headers.ETag = new StringValues(translationFile.Hash);

            var entry = translationFile.Entries.Single(entry => entry.Key == key);
            return Json(new
            {
                entry.Key, entry.Context, entry.Source, entry.Translation, entry.RequiresPluralisation
            });
        }
        catch (InvalidOperationException)
        {
            return NotFound();
        }
    }
    
    [HttpPost]
    [Route("{project}/{subproject}/{language}/entries")]
    public async Task<IActionResult> SaveProjectEntries(string project, string subproject, string language)
    {
        try
        {
            var p = await _projectService.ProjectBySystemName(project);
            var translationFile = p.GetParlanceProject().SubprojectBySystemName(subproject).Language(language).TranslationFile;
            if (translationFile is null) return NotFound();

            if (!Request.Headers.IfMatch.Contains(translationFile.Hash)) return StatusCode(412); //Precondition Failed

            await translationFile.Save();

            Response.Headers.ETag = new StringValues(translationFile.Hash);
            
            return NoContent();
        }
        catch (SubprojectNotFoundException)
        {
            return NotFound();
        }
        catch (ProjectNotFoundException)
        {
            return NotFound();
        }
    }
}