using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Parlance.Vicr123Accounts.Authentication;
using Parlance.Vicr123Accounts.Services;
using Tmds.DBus;

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

    public class UserTokenRequestData
    {
        public string Username { get; set; }
        public string Password { get; set; }
        public string? OtpToken { get; set; }
        public string? NewPassword { get; set; }
    }
}