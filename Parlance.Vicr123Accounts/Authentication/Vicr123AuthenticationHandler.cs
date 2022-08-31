using System.Security.Claims;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Parlance.Vicr123Accounts.Services;
using Tmds.DBus;

namespace Parlance.Vicr123Accounts.Authentication;

public class Vicr123AuthenticationHandler : AuthenticationHandler<Vicr123AuthenticationOptions>
{
    private readonly IVicr123AccountsService _accountsService;
    public const string AuthenticationScheme = "Vicr123Accounts";

    public Vicr123AuthenticationHandler(IOptionsMonitor<Vicr123AuthenticationOptions> options,
                                        ILoggerFactory logger,
                                        UrlEncoder encoder,
                                        ISystemClock clock,
                                        IVicr123AccountsService accountsService) : base(options, logger, encoder, clock)
    {
        _accountsService = accountsService;
    }

    protected override async Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        var authHeader = Request.Headers.Authorization;
        if (authHeader.Count == 0) return AuthenticateResult.Fail("No auth token");

        var authHeaderValue = authHeader[0];
        if (!authHeaderValue.StartsWith("Bearer ")) return AuthenticateResult.Fail("No auth token");

        var token = authHeaderValue[7..];
        
        try
        {
            var user = await _accountsService.UserByToken(token);

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