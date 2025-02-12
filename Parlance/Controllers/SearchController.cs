using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Parlance.Project;
using Parlance.Services.Projects;

namespace Parlance.Controllers;

[ApiController]
[Route("api/[controller]")]
[EnableRateLimiting("limiter")]
public class SearchController(IProjectService projectService) : Controller
{
    [HttpPost]
    public async Task<IActionResult> Search([FromBody] SearchRequestData data)
    {
        if (data.Query == string.Empty)
        {
            return Json(Enumerable.Empty<object>());
        }
        
        var projects = (await projectService.Projects()).ToList();
        var subprojects = projects.SelectMany(project => project.GetParlanceProject().Subprojects);
        return Json(projects.Where(project => project.Name.IndexOf(data.Query, StringComparison.InvariantCultureIgnoreCase) != -1).Select(project => new
        {
            Name = project.Name,
            Href = $"/projects/{project.SystemName}",
            Type = "project"
        }).Union<object>(subprojects.Where(subproject => subproject.Name.IndexOf(data.Query, StringComparison.InvariantCultureIgnoreCase) != -1).Select(subproject => new
        {
            Name = subproject.Name,
            Href = $"projects/{subproject.Project.SystemName}/{subproject.SystemName}",
            Type = "subproject",
            Languages = subproject.AvailableLanguages().Select(x => x.ToDashed()),
            ParentProjectName = subproject.Project.ReadableName
        })));
    }

    public class SearchRequestData
    {
        public required string Query { get; set; }
    }
}