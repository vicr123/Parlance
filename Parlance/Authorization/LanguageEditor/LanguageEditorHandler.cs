using Microsoft.AspNetCore.Authorization;
using Parlance.CLDR;
using Parlance.Services.Permissions;
using Parlance.Vicr123Accounts.Authentication;

namespace Parlance.Authorization.LanguageEditor;

public class LanguageEditorHandler : AuthorizationHandler<LanguageEditorRequirement>
{
    private readonly IPermissionsService _permissionsService;

    public LanguageEditorHandler(IPermissionsService permissionsService)
    {
        _permissionsService = permissionsService;
    }

    protected override async Task HandleRequirementAsync(AuthorizationHandlerContext context,
        LanguageEditorRequirement requirement)
    {
        if (context.Resource is not HttpContext httpContext) return;

        var username = httpContext.User.Claims.FirstOrDefault(claim => claim.Type == Claims.Username)?.Value;
        if (username is null) return;
        
        var routeData = httpContext.GetRouteData();
        if (!routeData.Values.ContainsKey("project")) return;
        if (!routeData.Values.ContainsKey("language")) return;
        
        if (await _permissionsService.CanEditProjectLocale(username, routeData.Values["project"]!.ToString()!,
                routeData.Values["language"]!.ToString()!.ToLocale()))
        {
            context.Succeed(requirement);
        }
    }
}