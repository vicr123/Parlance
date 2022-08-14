using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Parlance.Vicr123Accounts.Authentication;
using Parlance.Vicr123Accounts.Services;
using Tmds.DBus;

// ReSharper disable AutoPropertyCanBeMadeGetOnly.Global

namespace Parlance.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UserController : Controller
{
    private readonly IVicr123AccountsService _accountsService;

    public UserController(IVicr123AccountsService accountsService)
    {
        _accountsService = accountsService;
    }

    [Authorize(Policy = "HasToken")]
    public async Task<IActionResult> GetUser()
    {
        var userId = ulong.Parse(HttpContext.User.Claims.First(claim => claim.Type == Claims.UserId).Value);
        var user = await _accountsService.UserById(userId);

        return Json(new
        {
            user.Username, user.Email
        });
    }

    public class UserTokenRequestData
    {
        public string Username { get; set; } = null!;
        public string Password { get; set; } = null!;
        public string? OtpToken { get; set; }
        public string? NewPassword { get; set; }
    }

    [HttpPost]
    [Route("token")]
    public async Task<IActionResult> GetUserToken([FromBody] UserTokenRequestData data)
    {
        try
        {
            var token = await _accountsService.ProvisionTokenAsync(new ProvisionTokenParameters
            {
                Username = data.Username,
                Password = data.Password,
                OtpToken = data.OtpToken,
                NewPassword = data.NewPassword
            });

            return Json(new
            {
                Token = token
            });
        }
        catch (DBusException ex)
        {
            return Unauthorized(new
            {
                Status = ex.ErrorName switch
                {
                    "com.vicr123.accounts.Error.DisabledAccount" => "DisabledAccount",
                    "com.vicr123.accounts.Error.TwoFactorRequired" => "OtpRequired",
                    "com.vicr123.accounts.Error.PasswordResetRequired" => "PasswordResetRequired",
                    "com.vicr123.accounts.Error.PasswordResetRequestRequired" => "PasswordResetRequestRequired",
                    _ => "Failed"
                }
            });
        }
    }

    public class PasswordResetMethodsRequestData
    {
        public string Username { get; init; } = null!;
    }
    
    [HttpPost]
    [Route("reset/methods")]
    public async Task<IActionResult> GetPasswordResetMethods([FromBody] PasswordResetMethodsRequestData data)
    {
        var user = await _accountsService.UserByUsername(data.Username);
        return Json(
            (await _accountsService.PasswordResetMethods(user)).Select(method =>
            {
                if (method is EmailPasswordResetMethod emailMethod)
                {
                    return new
                    {
                        Type = "email",
                        emailMethod.Domain,
                        emailMethod.User
                    };
                }

                return null;
            }).Where(method => method is not null)
        );
    }

    public class PerformResetRequestData
    {
        public string Username { get; set; } = null!;
        public string Type { get; set; } = null!;
        public IDictionary<string, object> Challenge { get; set; } = null!;
    }
    
    [HttpPost]
    [Route("reset")]
    public async Task<IActionResult> PerformReset([FromBody] PerformResetRequestData data)
    {
        var user = await _accountsService.UserByUsername(data.Username);
        await _accountsService.PerformPasswordReset(user, data.Type, data.Challenge.ToDictionary(item => item.Key,
            item =>
            {
                if (item.Value is JsonElement json)
                {
                    return json.ValueKind switch
                    {
                        JsonValueKind.Undefined => "undefined",
                        JsonValueKind.Object => "TODO",
                        JsonValueKind.Array => "TODO",
                        JsonValueKind.String => json.GetString() ?? "null",
                        JsonValueKind.Number => json.GetDecimal(),
                        JsonValueKind.True => true,
                        JsonValueKind.False => false,
                        JsonValueKind.Null => "null",
                        _ => throw new ArgumentOutOfRangeException()
                    };
                }
                return item.Value;
            }));
        return NoContent();
    }
}
