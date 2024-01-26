using Microsoft.AspNetCore.Authorization;
using Parlance.Services.ProjectMaintainers;
using Parlance.Services.Projects;
using Parlance.Vicr123Accounts.Authentication;

namespace Parlance.Authorization.ProjectAdministrator;

public class ProjectManagerHandler(IProjectMaintainersService projectMaintainersService, IProjectService projectService)
    : AuthorizationHandler<ProjectManagerRequirement>
{
    protected override async Task HandleRequirementAsync(AuthorizationHandlerContext context,
        ProjectManagerRequirement requirement)
    {
        if (context.Resource is not HttpContext httpContext) return;

        var username = httpContext.User.FindFirst(Claims.Username)?.Value;
        if (username is null) return;

        var routeData = httpContext.GetRouteData();
        if (!routeData.Values.TryGetValue("project", out var projectName)) return;

        var p = await projectService.ProjectBySystemName((string)projectName!);

        if (await projectMaintainersService.IsProjectMaintainer(username, p)) context.Succeed(requirement);
    }
}