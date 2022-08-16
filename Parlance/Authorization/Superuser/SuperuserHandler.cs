using Microsoft.AspNetCore.Authorization;
using Parlance.Services;
using Parlance.Vicr123Accounts.Authentication;

namespace Parlance.Authorization.Superuser;

public class SuperuserHandler : AuthorizationHandler<SuperuserRequirement>
{
    private readonly ISuperuserService _superuserService;

    public SuperuserHandler(ISuperuserService superuserService)
    {
        _superuserService = superuserService;
    }

    protected override async Task HandleRequirementAsync(AuthorizationHandlerContext context, SuperuserRequirement requirement)
    {
        if (context.Resource is not HttpContext httpContext) return;

        var username = httpContext.User.Claims.FirstOrDefault(claim => claim.Type == Claims.Username)?.Value;
        if (username is null) return;
        
        if (await _superuserService.IsSuperuser(username)) context.Succeed(requirement);
    }
}