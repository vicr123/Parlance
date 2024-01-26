using System.Security.Claims;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Parlance.Vicr123Accounts.Services;
using Tmds.DBus;

namespace Parlance.Vicr123Accounts.Authentication;

public class Vicr123AuthenticationHandler(
    IOptionsMonitor<Vicr123AuthenticationOptions> options,
    ILoggerFactory logger,
    UrlEncoder encoder,
    IVicr123AccountsService accountsService)
    : AuthenticationHandler<Vicr123AuthenticationOptions>(options, logger, encoder)
{
    public const string AuthenticationScheme = "Vicr123Accounts";

    protected override async Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        var authHeader = Request.Headers.Authorization;
        if (authHeader is not [ string authHeaderValue, .. ] || !authHeaderValue.StartsWith("Bearer ")) return AuthenticateResult.Fail("No auth token");

        var token = authHeaderValue[7..];
        
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
            return AuthenticateResult.Success(
                new AuthenticationTicket(new ClaimsPrincipal(identity), AuthenticationScheme));
        }
        catch (DBusException)
        {
            return AuthenticateResult.Fail("Invalid Token");
        }
    }
}