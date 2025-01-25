using System.Globalization;
using LibGit2Sharp;
using MessagePipe;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Primitives;
using Npgsql;
using Parlance.CldrData;
using Parlance.Glossary.Services;
using Parlance.Helpers;
using Parlance.Hubs;
using Parlance.Project;
using Parlance.Project.Events;
using Parlance.Project.Exceptions;
using Parlance.Project.Index;
using Parlance.Project.SourceStrings;
using Parlance.Project.TranslationFiles;
using Parlance.Services.Comments;
using Parlance.Services.Permissions;
using Parlance.Services.ProjectMaintainers;
using Parlance.Services.Projects;
using Parlance.VersionControl.Services.PendingEdits;
using Parlance.Vicr123Accounts.Authentication;
using Parlance.Vicr123Accounts.Services;
using Tmds.DBus;

namespace Parlance.Controllers;

[ApiController]
[Route("api/[controller]")]
[EnableRateLimiting("limiter")]
public class ProjectsController(
    IProjectService projectService,
    IPermissionsService permissionsService,
    IPendingEditsService pendingEditsService,
    IParlanceIndexingService indexingService,
    IParlanceSourceStringsService sourceStringsService,
    IVicr123AccountsService accountsService,
    IProjectMaintainersService projectMaintainersService,
    IGlossaryService glossaryService,
    ICommentsService commentsService,
    IAsyncPublisher<TranslationSubmitEvent> translationSubmitEventPublisher,
    IHubContext<TranslatorHub, ITranslatorClient> translatorHubContext)
    : Controller
{
    [HttpGet]
    public async Task<IActionResult> GetProjects()
    {
        var projects = (await projectService.Projects()).ToList();
        return Json(await Task.WhenAll(projects.Select<Database.Models.Project, Task<object>>(async project =>
        {
            try
            {
                var parlanceProject = project.GetParlanceProject();
                var indexResults = await indexingService.OverallResults(parlanceProject);
                return new
                {
                    CompletionData = indexResults,
                    Name = parlanceProject.ReadableName, project.SystemName, parlanceProject.Deadline
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
    
    
    [HttpGet]
    [Route("languages")]
    public async Task<IActionResult> GetUsedLanguages()
    {
        var languages = (await projectService.Projects()).SelectMany(project =>
        {
            try
            {
                return project.GetParlanceProject().Subprojects.SelectMany(subproject => subproject.AvailableLanguages());
            }
            catch (ParlanceJsonFileParseException)
            {
                return Enumerable.Empty<Locale>();
            }
        });

        return Json(await Task.WhenAll(languages.Distinct().Select(async lang =>
        {
            var languageIndexResults = await indexingService.OverallResults(lang);
            return new
            {
                CompletionData = languageIndexResults,
                Language = lang.ToDashed(),
                LanguageName = new CultureInfo(lang.ToDashed()).DisplayName
            };
        })));
    }
    
    
    [HttpGet]
    [Route("languages/{language}")]
    public async Task<IActionResult> GetSubprojectsWithLanguage(string language)
    {
        var locale = language.ToLocale();
        var projects = await projectService.Projects();

        return Json(await Task.WhenAll(projects.Select<Database.Models.Project, Task<object>>(async project =>
        {
            try
            {
                var parlanceProject = project.GetParlanceProject();
                return new
                {
                    Name = parlanceProject.ReadableName,
                    parlanceProject.Deadline, project.SystemName,
                    Subprojects = await Task.WhenAll(parlanceProject.Subprojects.Select(async subproject =>
                {
                        var preferredLocale = subproject.CalculatePreferredLocale(locale);
                        if (!subproject.AvailableLanguages().Contains(preferredLocale))
                        {
                            return (object)new
                            {
                                subproject.SystemName, subproject.Name,
                                subproject.PreferRegionAgnosticLanguage,
                                RealLocale = preferredLocale.ToDashed()
                            };
                        }

                        var subprojectIndexResults =
                            await indexingService.OverallResults(subproject.Language(preferredLocale));

                        return new
                        {
                            CompletionData = subprojectIndexResults,
                            subproject.SystemName, subproject.Name,
                            subproject.PreferRegionAgnosticLanguage,
                            RealLocale = preferredLocale.ToDashed()
                        };
                    }))
                };
            }
            catch (Exception)
            {
                return new
                {
                    project.Name,
                    project.SystemName,
                    Error = true,
                    Subprojects = Enumerable.Empty<object>()
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
            await projectService.RegisterProject(data.CloneUrl, data.Branch, data.Name);
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
            var p = await projectService.ProjectBySystemName(project);
            await projectService.RemoveProject(p);
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
        var username = HttpContext.User.Claims.FirstOrDefault(claim => claim.Type == Claims.Username)?.Value;
        try
        {
            var p = await projectService.ProjectBySystemName(project);
            try
            {
                var proj = p.GetParlanceProject();

                var indexResults = await indexingService.OverallResults(proj);


                return Json(new
                {
                    CompletionData = indexResults,
                    p.Name, proj.Deadline,
                    IsProjectManager = await projectMaintainersService.IsProjectMaintainer(username, p),
                    Subprojects = await Task.WhenAll(proj.Subprojects.Select(async subproject =>
                    {
                        var subprojectIndexResults = await indexingService.OverallResults(subproject);

                        return new
                        {
                            CompletionData = subprojectIndexResults,
                            subproject.SystemName, subproject.Name
                        };
                    })),
                    CanManage = await permissionsService.HasManageProjectPermission(username, project)
                });
            }
            catch (ParlanceJsonFileParseException)
            {
                return StatusCode(500, new
                {
                    Error = "ParlanceJsonFileParseError",
                    IsProjectManager = await projectMaintainersService.IsProjectMaintainer(username, p),
                });
            }
        }
        catch (ProjectNotFoundException)
        {
            return NotFound();
        }
    }


    [HttpPost]
    [Authorize(Policy = "ProjectManager")]
    [Route("{project}/reindex")]
    public async Task<IActionResult> ReindexProject(string project)
    {
        try
        {
            var p = await projectService.ProjectBySystemName(project);
            var proj = p.GetParlanceProject();

            await indexingService.IndexProject(proj);
            return NoContent();
        }
        catch (ProjectNotFoundException)
        {
            return NotFound();
        }
    }

    [Authorize(Policy = "Superuser")]
    [HttpGet]
    [Route("{project}/maintainers")]
    public async Task<IActionResult> GetProjectMaintainers(string project)
    {
        var p = await projectService.ProjectBySystemName(project);

        return Json(await projectMaintainersService.ProjectMaintainers(p).ToListAsync());
    }

    [Authorize(Policy = "Superuser")]
    [HttpPost]
    [Route("{project}/maintainers")]
    public async Task<IActionResult> AddProjectMaintainer(string project, [FromBody] AddProjectMaintainerData data)
    {
        try
        {
            var p = await projectService.ProjectBySystemName(project);
            await projectMaintainersService.AddProjectMaintainer(data.Name, p);

            return NoContent();
        }
        catch (DBusException ex) when (ex.ErrorName == "com.vicr123.accounts.Error.NoAccount")
        {
            return this.ClientError(ParlanceClientError.UnknownUser);
        }
        catch (InvalidOperationException)
        {
            return this.ClientError(ParlanceClientError.PermissionAlreadyGranted);
        }
    }

    [Authorize(Policy = "Superuser")]
    [HttpDelete]
    [Route("{project}/maintainers/{username}")]
    public async Task<IActionResult> RemoveProjectMaintainers(string project, string username)
    {
        try
        {
            var p = await projectService.ProjectBySystemName(project);
            await projectMaintainersService.RemoveProjectMaintainer(username, p);
            return NoContent();
        }
        catch (DBusException ex) when (ex.ErrorName == "com.vicr123.accounts.Error.NoAccount")
        {
            return this.ClientError(ParlanceClientError.UnknownUser);
        }
        catch (InvalidOperationException)
        {
            return BadRequest();
        }
    }
    
    
    [HttpGet]
    [Route("{project}/glossary")]
    public async Task<IActionResult> GetConnectedGlossaries(string project)
    {
        try
        {
            var p = await projectService.ProjectBySystemName(project);
            return Json(glossaryService.ConnectedGlossaries(p).Select(x => new
            {
                x.Id, x.Name
            }));
        }
        catch (ProjectNotFoundException)
        {
            return NotFound();
        }
        catch (DbUpdateException ex) when (ex.InnerException is PostgresException
                                           {
                                               SqlState: PostgresErrorCodes.UniqueViolation
                                           })
        {
            return Conflict();
        }
    }
    
    [HttpPost]
    [Authorize(Policy = "ProjectManager")]
    [Route("{project}/glossary")]
    public async Task<IActionResult> ConnectGlossary(string project, [FromBody] ConnectGlossaryRequestData data)
    {
        try
        {
            var p = await projectService.ProjectBySystemName(project);
            var glossary = glossaryService.GlossaryById(data.GlossaryId);
            await glossaryService.ConnectGlossary(glossary, p);
            return NoContent();
        }
        catch (ProjectNotFoundException)
        {
            return NotFound();
        }
        catch (DbUpdateException ex) when (ex.InnerException is PostgresException
                                           {
                                               SqlState: PostgresErrorCodes.UniqueViolation
                                           })
        {
            return Conflict();
        }
    }
    
    [HttpDelete]
    [Authorize(Policy = "ProjectManager")]
    [Route("{project}/glossary/{glossary:guid}")]
    public async Task<IActionResult> DisconnectGlossary(string project, Guid glossary)
    {
        try
        {
            var p = await projectService.ProjectBySystemName(project);
            var g = glossaryService.GlossaryById(glossary);
            await glossaryService.DisconnectGlossary(g, p);
            return NoContent();
        }
        catch (ProjectNotFoundException)
        {
            return NotFound();
        }
        catch (InvalidOperationException)
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
            var p = await projectService.ProjectBySystemName(project);
            var subproj = p.GetParlanceProject().SubprojectBySystemName(subproject);

            var indexResults = await indexingService.OverallResults(subproj);

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
                subproj.PreferRegionAgnosticLanguage,
                ProjectName = subproj.Project.Name,
                AvailableLanguages = await Task.WhenAll(subproj.AvailableLanguages().Select(async lang =>
                {
                    var subprojectLanguage = subproj.Language(lang);
                    var subprojectLanguageIndexResults = await indexingService.OverallResults(subprojectLanguage);

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

    [Authorize(Policy = "LanguageEditor")]
    [HttpPost]
    [Route("{project}/{subproject}/{language}")]
    public async Task<IActionResult> CreateProjectLanguage(string project, string subproject, string language)
    {
        var p = await projectService.ProjectBySystemName(project);
        var subp = p.GetParlanceProject().SubprojectBySystemName(subproject);
        var subprojectLanguage = subp.Language(language.ToLocale());

        if (subprojectLanguage.Exists) return Conflict();

        //Create the language file
        await subprojectLanguage.WriteNewTranslationFile(indexingService);

        return NoContent();
    }

    [HttpGet]
    [Route("{project}/{subproject}/{language}")]
    public async Task<IActionResult> GetProjectMeta(string project, string subproject, string language)
    {
        try
        {
            var p = await projectService.ProjectBySystemName(project);
            var subp = p.GetParlanceProject().SubprojectBySystemName(subproject);
            var subprojectLanguage = subp.Language(language.ToLocale());

            if (!subprojectLanguage.Exists) return NotFound();

            var indexResults = await indexingService.OverallResults(subprojectLanguage);
            await using var translationFile = await subprojectLanguage.CreateTranslationFile(indexingService);

            var username = HttpContext.User.Claims.FirstOrDefault(claim => claim.Type == Claims.Username)?.Value;

            var openThreads = commentsService.Threads(project, subproject, language.ToLocale(), openOnly: true);

            return Json(new
            {
                CompletionData = indexResults,
                ProjectName = p.Name,
                SubprojectName = subp.Name,
                Language = subprojectLanguage.Locale.ToDashed(),
                CanEdit = await permissionsService.CanEditProjectLocale(username, project, language.ToLocale()),
                OpenThreads = await commentsService.GetJsonThreads(openThreads)
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
            var p = await projectService.ProjectBySystemName(project);
            var subprojectLanguage = p.GetParlanceProject().SubprojectBySystemName(subproject)
                .Language(language.ToLocale());
            await using var translationFile = await subprojectLanguage.CreateTranslationFile(indexingService);
            if (translationFile is null) return NotFound();

            Response.Headers["X-Parlance-Hash"] = new StringValues(translationFile.Hash);

            return Json(await Task.WhenAll(translationFile.Entries.Select(async entry => new
            {
                entry.Key, entry.Context, entry.Source, entry.Translation, entry.RequiresPluralisation, entry.Comment,
                OldSourceString = await sourceStringsService.GetSourceStringChange(subprojectLanguage, entry)
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
            var p = await projectService.ProjectBySystemName(project);
            var subprojectLanguage = p.GetParlanceProject().SubprojectBySystemName(subproject)
                .Language(language.ToLocale());
            await using var translationFile = await subprojectLanguage.CreateTranslationFile(indexingService);
            if (translationFile is null) return NotFound();

            Response.Headers["X-Parlance-Hash"] = new StringValues(translationFile.Hash);

            var entry = translationFile.Entries.Single(entry => entry.Key == key);
            return Json(new
            {
                entry.Key, entry.Context, entry.Source, entry.Translation, entry.RequiresPluralisation,
                OldSourceString = await sourceStringsService.GetSourceStringChange(subprojectLanguage, entry)
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
            var user = await accountsService.UserById(userId);

            var p = await projectService.ProjectBySystemName(project);
            var subprojectLanguage = p.GetParlanceProject().SubprojectBySystemName(subproject)
                .Language(language.ToLocale());
            await using var translationFile = await subprojectLanguage.CreateTranslationFile(indexingService);
            if (translationFile is null) return NotFound();

            if (!Request.Headers.IfMatch.Contains(translationFile.Hash)) return StatusCode(412); //Precondition Failed

            var entry = translationFile.Entries.Single(entry => entry.Key == key);
            if (!data.ForceUpdate && entry.Translation.SequenceEqual(data.TranslationStrings))
            {
                Response.Headers["X-Parlance-Hash"] = new StringValues(translationFile.Hash);
                return NoContent();
            }

            entry.Translation = data.TranslationStrings;
            
            await translationSubmitEventPublisher.PublishAsync(new()
            {
                Project = p,
                SubprojectLanguage = subprojectLanguage,
                Entry = entry,
                User = user
            });

            await translationFile.Save();
            
            // Tell SignalR
            await translatorHubContext.Clients.Group(TranslatorHub.GetGroup(project, subproject, language.ToLocale()))
                .TranslationUpdated(translationFile.Hash, new Dictionary<string, IList<TranslationWithPluralType>>()
                {
                    {key, data.TranslationStrings}
                });

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
            var user = await accountsService.UserById(userId);

            var p = await projectService.ProjectBySystemName(project);
            var subprojectLanguage = p.GetParlanceProject().SubprojectBySystemName(subproject)
                .Language(language.ToLocale());
            await using var translationFile = await subprojectLanguage.CreateTranslationFile(indexingService);
            if (translationFile is null) return NotFound();

            if (!Request.Headers.IfMatch.Contains(translationFile.Hash)) return StatusCode(412); //Precondition Failed

            var updatedData = new Dictionary<string, IList<TranslationWithPluralType>>();
            foreach (var (key, translationData) in data)
            {
                var entry = translationFile.Entries.Single(entry => entry.Key == key);
                if (!translationData.ForceUpdate &&
                    entry.Translation.SequenceEqual(translationData.TranslationStrings)) continue;

                entry.Translation = translationData.TranslationStrings;

                //Record this edit in the database
                await translationSubmitEventPublisher.PublishAsync(new()
                {
                    Project = p,
                    SubprojectLanguage = subprojectLanguage,
                    Entry = entry,
                    User = user
                });
            
                updatedData.Add(key, translationData.TranslationStrings);
            }

            await translationFile.Save();
            
            // Tell SignalR
            await translatorHubContext.Clients.Group(TranslatorHub.GetGroup(project, subproject, language.ToLocale()))
                .TranslationUpdated(translationFile.Hash, updatedData);

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
    
    [HttpGet]
    [Route("{project}/{language}/glossary")]
    public async Task<IActionResult> GetGlossary(string project, string language)
    {
        try
        {
            var p = await projectService.ProjectBySystemName(project);
            var locale = language.ToLocale();
            return Json(glossaryService.SearchGlossaryByProject(p, locale, null).Select(x => new
            {
                x.Id, x.Term, x.Translation, x.PartOfSpeech
            }));
        }
        catch (ProjectNotFoundException)
        {
            return NotFound();
        }
    }
    
    [HttpPost]
    [Route("{project}/{language}/glossary")]
    public async Task<IActionResult> SearchGlossary(string project, string language,
        [FromBody] SearchGlossaryRequestData data)
    {
        try
        {
            var p = await projectService.ProjectBySystemName(project);
            var locale = language.ToLocale();
            return Json(glossaryService.SearchGlossaryByProject(p, locale, data.SearchTerm).Select(x => new
            {
                x.Id, x.Term, x.Translation, x.PartOfSpeech
            }));
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

    public class AddProjectMaintainerData
    {
        public string Name { get; set; } = null!;
    }

    public class UpdateProjectEntryRequestData
    {
        public bool ForceUpdate { get; set; }
        public IList<TranslationWithPluralType> TranslationStrings { get; set; } = null!;
    }

    public class ConnectGlossaryRequestData
    {
        public required Guid GlossaryId { get; set; }
    }

    public class SearchGlossaryRequestData
    {
        public required string? SearchTerm { get; set; }
    }
}