using System.Globalization;
using LibGit2Sharp;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Primitives;
using Parlance.CldrData;
using Parlance.Helpers;
using Parlance.Project;
using Parlance.Project.Exceptions;
using Parlance.Project.Index;
using Parlance.Project.SourceStrings;
using Parlance.Project.TranslationFiles;
using Parlance.Services.Permissions;
using Parlance.Services.Projects;
using Parlance.VersionControl.Services.PendingEdits;
using Parlance.Vicr123Accounts.Authentication;
using Parlance.Vicr123Accounts.Services;

namespace Parlance.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProjectsController : Controller
{
    private readonly IVicr123AccountsService _accountsService;
    private readonly IParlanceIndexingService _indexingService;
    private readonly IPendingEditsService _pendingEditsService;
    private readonly IPermissionsService _permissionsService;
    private readonly IProjectService _projectService;
    private readonly IParlanceSourceStringsService _sourceStringsService;

    public ProjectsController(IProjectService projectService,
        IPermissionsService permissionsService,
        IParlanceIndexingService indexingService, IParlanceSourceStringsService sourceStringsService,
        IPendingEditsService pendingEditsService, IVicr123AccountsService accountsService)
    {
        _projectService = projectService;
        _permissionsService = permissionsService;
        _indexingService = indexingService;
        _sourceStringsService = sourceStringsService;
        _pendingEditsService = pendingEditsService;
        _accountsService = accountsService;
    }

    [HttpGet]
    public async Task<IActionResult> GetProjects()
    {
        var projects = (await _projectService.Projects()).ToList();
        return Json(await Task.WhenAll(projects.Select<Database.Models.Project, Task<object>>(async project =>
        {
            try
            {
                var parlanceProject = project.GetParlanceProject();
                var indexResults = await _indexingService.OverallResults(parlanceProject);
                return new
                {
                    CompletionData = indexResults,
                    Name = parlanceProject.ReadableName, project.SystemName
                };
            }
            catch (ParlanceJsonFileParseException)
            {
                return new
                {
                    project.Name, project.SystemName, Error = true
                };
            }
        })));
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
            return this.ClientError(ParlanceClientError.GitError, ex.Message);
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

            var indexResults = await _indexingService.OverallResults(proj);

            var username = HttpContext.User.Claims.FirstOrDefault(claim => claim.Type == Claims.Username)?.Value;

            return Json(new
            {
                CompletionData = indexResults,
                p.Name,
                Subprojects = await Task.WhenAll(proj.Subprojects.Select(async subproject =>
                {
                    var subprojectIndexResults = await _indexingService.OverallResults(subproject);

                    return new
                    {
                        CompletionData = subprojectIndexResults,
                        subproject.SystemName, subproject.Name
                    };
                })),
                CanManage = await _permissionsService.HasManageProjectPermission(username, project)
            });
        }
        catch (ProjectNotFoundException)
        {
            return NotFound();
        }
        catch (ParlanceJsonFileParseException)
        {
            return StatusCode(500, new
            {
                Error = "ParlanceJsonFileParseError"
            });
        }
    }


    [HttpPost]
    [Authorize(Policy = "ProjectManager")]
    [Route("{project}/reindex")]
    public async Task<IActionResult> ReindexProject(string project)
    {
        try
        {
            var p = await _projectService.ProjectBySystemName(project);
            var proj = p.GetParlanceProject();

            await _indexingService.IndexProject(proj);
            return NoContent();
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

            var indexResults = await _indexingService.OverallResults(subproj);

            if (!System.IO.File.Exists(subproj.BasePath))
                return StatusCode(500, new
                {
                    subproj.TranslationFileType,
                    subproj.Name,
                    Error = "InvalidBaseFile"
                });

            return Json(new
            {
                CompletionData = indexResults,
                subproj.TranslationFileType,
                subproj.Name,
                ProjectName = subproj.Project.Name,
                AvailableLanguages = await Task.WhenAll(subproj.AvailableLanguages().Select(async lang =>
                {
                    var subprojectLanguage = subproj.Language(lang);
                    var subprojectLanguageIndexResults = await _indexingService.OverallResults(subprojectLanguage);

                    return new
                    {
                        CompletionData = subprojectLanguageIndexResults,
                        Language = lang.ToDashed(),
                        LanguageName = new CultureInfo(lang.ToDashed()).DisplayName
                    };
                }))
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


    [HttpPost]
    [Route("{project}/{subproject}/{language}")]
    public async Task<IActionResult> CreateProjectLanguage(string project, string subproject, string language)
    {
        var p = await _projectService.ProjectBySystemName(project);
        var subp = p.GetParlanceProject().SubprojectBySystemName(subproject);
        var subprojectLanguage = subp.Language(language.ToLocale());

        if (subprojectLanguage.Exists) return Conflict();

        //Create the language file
        await subprojectLanguage.WriteNewTranslationFile(_indexingService);

        return NoContent();
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

            if (!subprojectLanguage.Exists) return NotFound();

            var indexResults = await _indexingService.OverallResults(subprojectLanguage);
            await using var translationFile = await subprojectLanguage.CreateTranslationFile(_indexingService);

            var username = HttpContext.User.Claims.FirstOrDefault(claim => claim.Type == Claims.Username)?.Value;

            return Json(new
            {
                CompletionData = indexResults,
                ProjectName = p.Name,
                SubprojectName = subp.Name,
                Language = subprojectLanguage.Locale.ToDashed(),
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
            var subprojectLanguage = p.GetParlanceProject().SubprojectBySystemName(subproject)
                .Language(language.ToLocale());
            await using var translationFile = await subprojectLanguage.CreateTranslationFile(_indexingService);
            if (translationFile is null) return NotFound();

            Response.Headers["X-Parlance-Hash"] = new StringValues(translationFile.Hash);

            return Json(await Task.WhenAll(translationFile.Entries.Select(async entry => new
            {
                entry.Key, entry.Context, entry.Source, entry.Translation, entry.RequiresPluralisation,
                OldSourceString = await _sourceStringsService.GetSourceStringChange(subprojectLanguage, entry)
            })));
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
    public async Task<IActionResult> GetProjectEntryByIndex(string project, string subproject, string language,
        string key)
    {
        try
        {
            var p = await _projectService.ProjectBySystemName(project);
            var subprojectLanguage = p.GetParlanceProject().SubprojectBySystemName(subproject)
                .Language(language.ToLocale());
            await using var translationFile = await subprojectLanguage.CreateTranslationFile(_indexingService);
            if (translationFile is null) return NotFound();

            Response.Headers["X-Parlance-Hash"] = new StringValues(translationFile.Hash);

            var entry = translationFile.Entries.Single(entry => entry.Key == key);
            return Json(new
            {
                entry.Key, entry.Context, entry.Source, entry.Translation, entry.RequiresPluralisation,
                OldSourceString = await _sourceStringsService.GetSourceStringChange(subprojectLanguage, entry)
            });
        }
        catch (InvalidOperationException)
        {
            return NotFound();
        }
    }

    [HttpPost]
    [Route("{project}/{subproject}/{language}/entries/{key}")]
    [Authorize(Policy = "LanguageEditor")]
    public async Task<IActionResult> UpdateProjectEntry(string project, string subproject, string language, string key,
        [FromBody] UpdateProjectEntryRequestData data)
    {
        try
        {
            var userId = ulong.Parse(HttpContext.User.Claims.First(claim => claim.Type == Claims.UserId).Value);
            var user = await _accountsService.UserById(userId);

            var p = await _projectService.ProjectBySystemName(project);
            var subprojectLanguage = p.GetParlanceProject().SubprojectBySystemName(subproject)
                .Language(language.ToLocale());
            await using var translationFile = await subprojectLanguage.CreateTranslationFile(_indexingService);
            if (translationFile is null) return NotFound();

            if (!Request.Headers.IfMatch.Contains(translationFile.Hash)) return StatusCode(412); //Precondition Failed

            var entry = translationFile.Entries.Single(entry => entry.Key == key);
            if (!data.ForceUpdate && entry.Translation.SequenceEqual(data.TranslationStrings))
            {
                Response.Headers["X-Parlance-Hash"] = new StringValues(translationFile.Hash);
                return NoContent();
            }

            entry.Translation = data.TranslationStrings;

            //Record this edit in the database
            await _sourceStringsService.RegisterSourceStringChange(subprojectLanguage, entry);
            await _pendingEditsService.RecordPendingEdit(subprojectLanguage, user);

            await translationFile.Save();

            Response.Headers["X-Parlance-Hash"] = new StringValues(translationFile.Hash);
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
    public async Task<IActionResult> UpdateProjectEntries(string project, string subproject, string language,
        [FromBody] IDictionary<string, UpdateProjectEntryRequestData> data)
    {
        try
        {
            var userId = ulong.Parse(HttpContext.User.Claims.First(claim => claim.Type == Claims.UserId).Value);
            var user = await _accountsService.UserById(userId);

            var p = await _projectService.ProjectBySystemName(project);
            var subprojectLanguage = p.GetParlanceProject().SubprojectBySystemName(subproject)
                .Language(language.ToLocale());
            await using var translationFile = await subprojectLanguage.CreateTranslationFile(_indexingService);
            if (translationFile is null) return NotFound();

            if (!Request.Headers.IfMatch.Contains(translationFile.Hash)) return StatusCode(412); //Precondition Failed

            foreach (var (key, translationData) in data)
            {
                var entry = translationFile.Entries.Single(entry => entry.Key == key);
                if (!translationData.ForceUpdate &&
                    entry.Translation.SequenceEqual(translationData.TranslationStrings)) continue;

                entry.Translation = translationData.TranslationStrings;

                //Record this edit in the database
                await _sourceStringsService.RegisterSourceStringChange(subprojectLanguage, entry);
                await _pendingEditsService.RecordPendingEdit(subprojectLanguage, user);
            }

            await translationFile.Save();

            Response.Headers["X-Parlance-Hash"] = new StringValues(translationFile.Hash);
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

    public class AddProjectRequestData
    {
        public string CloneUrl { get; set; } = null!;
        public string Name { get; set; } = null!;
        public string Branch { get; set; } = null!;
    }

    public class UpdateProjectEntryRequestData
    {
        public bool ForceUpdate { get; set; }
        public IList<TranslationWithPluralType> TranslationStrings { get; set; } = null!;
    }
}