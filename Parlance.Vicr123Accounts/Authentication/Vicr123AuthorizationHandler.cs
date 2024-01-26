using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Parlance.Vicr123Accounts.Services;
using Tmds.DBus;

namespace Parlance.Vicr123Accounts.Authentication;

public static class Claims
{
    public const string Token = "token";
    public const string Username = "username";
    public const string Email = "email";
    public const string UserId = "userId";
}

public class Vicr123AuthorizationHandler(IVicr123AccountsService accountsService) : IAuthorizationHandler
{
    public async Task HandleAsync(AuthorizationHandlerContext context)
    {
        if (context.Resource is not HttpContext httpContext)
        {
            context.Fail();
            return;
        }

        var authHeader =
            httpContext.Request.Headers["Authorization"].FirstOrDefault(header => header.StartsWith("Bearer "));
        if (authHeader is null)
        {
            context.Fail();
            return;
        }

        var token = authHeader[7..];
        try
        {
            var user = await accountsService.UserByToken(token);

            var claims = new[]
            {
                    new Claim(Claims.Token, token),
                    new Claim(Claims.Username, user.Username),
                    new Claim(Claims.Email, user.Email),
                    new Claim(Claims.UserId, user.Id.ToString())
                };
            var identity = new ClaimsIdentity(claims, "Vicr123Accounts");
            httpContext.User = new ClaimsPrincipal(identity);
        }
        catch (DBusException)
        {
            context.Fail();
        }
    }
}