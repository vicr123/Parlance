using Microsoft.AspNetCore.Authorization;

namespace Parlance.Authorization.LanguageEditor;

public class LanguageEditorHandler : AuthorizationHandler<LanguageEditorRequirement>
{
    protected override Task HandleRequirementAsync(AuthorizationHandlerContext context,
        LanguageEditorRequirement requirement)
    {
        if (context.Resource is not HttpContext httpContext) return Task.CompletedTask;

        if (httpContext.User.Claims.Any(claim => claim.Type == "token")) context.Succeed(requirement);

        return Task.CompletedTask;
    }
}