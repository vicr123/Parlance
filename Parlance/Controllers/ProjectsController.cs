using System.Globalization;
using LibGit2Sharp;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Primitives;
using Parlance.CLDR;
using Parlance.Helpers;
using Parlance.Project;
using Parlance.Project.TranslationFiles;
using Parlance.Services.Permissions;
using Parlance.Services.Projects;
using Parlance.Vicr123Accounts.Authentication;

namespace Parlance.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProjectsController : Controller
{
    private readonly IProjectService _projectService;
    private readonly IPermissionsService _permissionsService;

    public ProjectsController(IProjectService projectService, IPermissionsService permissionsService)
    {
        _projectService = projectService;
        _permissionsService = permissionsService;
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
        public string CloneUrl { get; set; } = null!;
        public string Name { get; set; } = null!;
        public string Branch { get; set; } = null!;
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
            return this.ClientError(ControllerExtensions.ErrorType.GitError, ex.Message);
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
                subproject.SystemName, subproject.Name
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

            return Json(new
            {
                subproj.TranslationFileType,
                AvailableLanguages = subproj.AvailableLanguages().Select(lang => new
                {
                    Language = lang.ToLocale().ToDashed(),
                    LanguageName = new CultureInfo(lang.ToLocale().ToDashed()).DisplayName
                })
            });
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
    [Route("{project}/{subproject}/{language}")]
    public async Task<IActionResult> GetProjectMeta(string project, string subproject, string language)
    {
        try
        {
            var p = await _projectService.ProjectBySystemName(project);
            var subp = p.GetParlanceProject().SubprojectBySystemName(subproject);
            var subprojectLanguage = subp.Language(language.ToLocale());
            
            var username = HttpContext.User.Claims.FirstOrDefault(claim => claim.Type == Claims.Username)?.Value;

            return Json(new
            {
                CanEdit = await _permissionsService.CanEditProjectLocale(username, project, language.ToLocale())
            });
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
            var translationFile = await p.GetParlanceProject().SubprojectBySystemName(subproject).Language(language.ToLocale()).CreateTranslationFile();
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
    
    public class UpdateProjectEntriesRequestData
    {
        public IDictionary<string, UpdateProjectEntryRequestData> Entries { get; set; } = null!;
    }

    [HttpGet]
    [Route("{project}/{subproject}/{language}/entries/{key}")]
    public async Task<IActionResult> GetProjectEntryByIndex(string project, string subproject, string language, string key)
    {
        try
        {
            var p = await _projectService.ProjectBySystemName(project);
            var translationFile = await p.GetParlanceProject().SubprojectBySystemName(subproject).Language(language.ToLocale()).CreateTranslationFile();
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

    public class UpdateProjectEntryRequestData
    {
        public IList<TranslationWithPluralType> TranslationStrings { get; set; } = null!;
    }

    [HttpPost]
    [Route("{project}/{subproject}/{language}/entries/{key}")]
    [Authorize(Policy = "LanguageEditor")]
    public async Task<IActionResult> UpdateProjectEntry(string project, string subproject, string language, string key, [FromBody] UpdateProjectEntryRequestData data)
    {
        try
        {
            var p = await _projectService.ProjectBySystemName(project);
            var translationFile = await p.GetParlanceProject().SubprojectBySystemName(subproject).Language(language.ToLocale()).CreateTranslationFile();
            if (translationFile is null) return NotFound();

            if (!Request.Headers.IfMatch.Contains(translationFile.Hash)) return StatusCode(412); //Precondition Failed

            var entry = translationFile.Entries.Single(entry => entry.Key == key);
            entry.Translation = data.TranslationStrings;
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

    [HttpPost]
    [Route("{project}/{subproject}/{language}/entries")]
    [Authorize(Policy = "LanguageEditor")]
    public async Task<IActionResult> UpdateProjectEntries(string project, string subproject, string language, [FromBody] IDictionary<string, UpdateProjectEntryRequestData> data)
    {
        try
        {
            var p = await _projectService.ProjectBySystemName(project);
            var translationFile = await p.GetParlanceProject().SubprojectBySystemName(subproject).Language(language.ToLocale()).CreateTranslationFile();
            if (translationFile is null) return NotFound();

            if (!Request.Headers.IfMatch.Contains(translationFile.Hash)) return StatusCode(412); //Precondition Failed
            
            foreach (var (key, translationData) in data)
            {
                var entry = translationFile.Entries.Single(entry => entry.Key == key);
                entry.Translation = translationData.TranslationStrings;
            }

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