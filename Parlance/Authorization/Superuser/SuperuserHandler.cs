using Microsoft.AspNetCore.Authorization;
using Parlance.Services.Superuser;
using Parlance.Vicr123Accounts.Authentication;

namespace Parlance.Authorization.Superuser;

public class SuperuserHandler(ISuperuserService superuserService) : AuthorizationHandler<SuperuserRequirement>
{
    protected override async Task HandleRequirementAsync(AuthorizationHandlerContext context, SuperuserRequirement requirement)
    {
        if (context.Resource is not HttpContext httpContext) return;

        var username = httpContext.User.Claims.FirstOrDefault(claim => claim.Type == Claims.Username)?.Value;
        if (username is null) return;
        
        if (await superuserService.IsSuperuser(username)) context.Succeed(requirement);
    }
}