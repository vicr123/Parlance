using Microsoft.AspNetCore.Authorization;
using Parlance.Services.ProjectMaintainers;
using Parlance.Services.Projects;
using Parlance.Vicr123Accounts.Authentication;

namespace Parlance.Authorization.ProjectAdministrator;

public class ProjectManagerHandler : AuthorizationHandler<ProjectManagerRequirement>
{
    private readonly IProjectMaintainersService _projectMaintainersService;
    private readonly IProjectService _projectService;

    public ProjectManagerHandler(IProjectMaintainersService projectMaintainersService, IProjectService projectService)
    {
        _projectMaintainersService = projectMaintainersService;
        _projectService = projectService;
    }

    protected override async Task HandleRequirementAsync(AuthorizationHandlerContext context,
        ProjectManagerRequirement requirement)
    {
        if (context.Resource is not HttpContext httpContext) return;

        var username = httpContext.User.FindFirst(Claims.Username)?.Value;
        if (username is null) return;

        var routeData = httpContext.GetRouteData();
        if (!routeData.Values.TryGetValue("project", out var projectName)) return;

        var p = await _projectService.ProjectBySystemName((string)projectName!);

        if (await _projectMaintainersService.IsProjectMaintainer(username, p)) context.Succeed(requirement);
    }
}