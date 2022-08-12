using Microsoft.AspNetCore.Authorization;

namespace Parlance.Authorization.HasToken;

public class HasTokenHandler : AuthorizationHandler<HasTokenRequirement>
{
    protected override Task HandleRequirementAsync(AuthorizationHandlerContext context, HasTokenRequirement requirement)
    {
        if (context.Resource is not HttpContext httpContext) return Task.CompletedTask;

        if (httpContext.User.Claims.Any(claim => claim.Type == "token")) context.Succeed(requirement);

        return Task.CompletedTask;
    }
}