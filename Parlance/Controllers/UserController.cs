using System.Text.Json;
using System.Text.Json.Serialization;
using Fido2NetLib;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Parlance.Helpers;
using Parlance.Services.Permissions;
using Parlance.Services.Superuser;
using Parlance.Vicr123Accounts.Authentication;
using Parlance.Vicr123Accounts.Services;
using Tmds.DBus;

// ReSharper disable UnusedAutoPropertyAccessor.Global
// ReSharper disable AutoPropertyCanBeMadeGetOnly.Global

namespace Parlance.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UserController : Controller
{
    private readonly IVicr123AccountsService _accountsService;

    private readonly IPermissionsService _permissionsService;
    private readonly ISuperuserService _superuserService;

    public UserController(IVicr123AccountsService accountsService, ISuperuserService superuserService,
        IPermissionsService permissionsService)
    {
        _accountsService = accountsService;
        _superuserService = superuserService;
        _permissionsService = permissionsService;
    }

    [Authorize]
    public async Task<IActionResult> GetUser()
    {
        var userId = ulong.Parse(HttpContext.User.Claims.First(claim => claim.Type == Claims.UserId).Value);
        var user = await _accountsService.UserById(userId);

        var superuser = await _superuserService.IsSuperuser(user.Username);

        return Json(new
        {
            user.Id, user.Username, user.Email, user.EmailVerified,
            Superuser = superuser,
            LanguagePermissions = await _permissionsService.UserPermissions(user.Username)
                .SelectAwait(x => ValueTask.FromResult(x.ToDashed())).ToListAsync()
        });
    }

    [HttpPost]
    public async Task<IActionResult> CreateUser([FromBody] CreateUserRequestData data)
    {
        try
        {
            await _accountsService.CreateUser(data.Username, data.Password, data.EmailAddress);
            var token = await _accountsService.ProvisionTokenAsync(new ProvisionTokenParameters
            {
                Username = data.Username,
                Password = data.Password
            });

            return Json(new
            {
                Token = token
            });
        }
        catch (DBusException ex) when (ex.ErrorName == "com.vicr123.accounts.Error.QueryError")
        {
            return this.ClientError(ParlanceClientError.UsernameAlreadyExists);
        }
    }

    [HttpPost]
    [Route("tokenTypes")]
    public async Task<IActionResult> GetOpportunitiesForLogin([FromBody] UsernameRequestData data)
    {
        try
        {
            return Json(await _accountsService.LoginMethods(data.Username));
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
                    "com.vicr123.accounts.Error.NoAccount" => "NoAccount",
                    _ => "Failed"
                }
            });
        }
    }

    [HttpPost]
    [Route("token")]
    public async Task<IActionResult> GetUserToken([FromBody] UserTokenRequestData data)
    {
        try
        {
            var methods = await _accountsService.LoginMethods(data.Username);
            if (!methods.Contains(data.Type)) return this.ClientError(ParlanceClientError.IncorrectParameters);

            switch (data.Type)
            {
                case "password":
                {
                    if (data is not UserTokenRequestDataPassword pwData)
                        return this.ClientError(ParlanceClientError.IncorrectParameters);

                    if (pwData.Password is null) return this.ClientError(ParlanceClientError.IncorrectParameters);

                    var token = await _accountsService.ProvisionTokenAsync(new ProvisionTokenParameters
                    {
                        Username = pwData.Username,
                        Password = pwData.Password,
                        OtpToken = pwData.OtpToken,
                        NewPassword = pwData.NewPassword
                    });

                    return Json(new
                    {
                        Token = token
                    });
                }
                case "fido":
                    if (data is not UserTokenRequestDataFido fidoData)
                        return this.ClientError(ParlanceClientError.IncorrectParameters);

                    if (fidoData.KeyTokenId is null || fidoData.KeyResponse is null)
                    {
                        var (id, response) = await _accountsService.GetFidoAssertionOptions(fidoData.Username);
                        return Json(new
                        {
                            Options = response,
                            Id = id
                        });
                    }

                    return Json(new
                    {
                        Token = await _accountsService.ProvisionTokenViaFido(fidoData.KeyTokenId.Value,
                            fidoData.KeyResponse)
                    });
            }

            return this.ClientError(ParlanceClientError.BadTokenRequestType);
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
        catch (Fido2VerificationException ex)
        {
            return Unauthorized(new
            {
                Status = "InvalidSecurityKey"
            });
        }
    }

    [HttpPost]
    [Route("reset/methods")]
    public async Task<IActionResult> GetPasswordResetMethods([FromBody] UsernameRequestData data)
    {
        var user = await _accountsService.UserByUsername(data.Username);
        return Json(
            (await _accountsService.PasswordResetMethods(user)).Select(m => m.ToJsonSerializable())
        );
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
                return item.Value;
            }));
        return NoContent();
    }

    [HttpPost]
    [Authorize]
    [Route("username")]
    public async Task<IActionResult> ChangeUsername([FromBody] ChangeUsernameRequestData data)
    {
        var userId = ulong.Parse(HttpContext.User.Claims.First(claim => claim.Type == Claims.UserId).Value);
        var user = await _accountsService.UserById(userId);

        if (!await _accountsService.VerifyUserPassword(user, data.Password)) return Forbid();

        user.Username = data.NewUsername;
        await _accountsService.UpdateUser(user);

        return NoContent();
    }

    [HttpPost]
    [Authorize]
    [Route("email")]
    public async Task<IActionResult> ChangeEmail([FromBody] ChangeEmailRequestData data)
    {
        var userId = ulong.Parse(HttpContext.User.Claims.First(claim => claim.Type == Claims.UserId).Value);
        var user = await _accountsService.UserById(userId);

        if (!await _accountsService.VerifyUserPassword(user, data.Password)) return Forbid();

        user.Email = data.NewEmail;
        await _accountsService.UpdateUser(user);

        return NoContent();
    }

    [HttpPost]
    [Authorize]
    [Route("password")]
    public async Task<IActionResult> ChangeEmail([FromBody] ChangePasswordRequestData data)
    {
        var userId = ulong.Parse(HttpContext.User.Claims.First(claim => claim.Type == Claims.UserId).Value);
        var user = await _accountsService.UserById(userId);

        if (!await _accountsService.VerifyUserPassword(user, data.Password)) return Forbid();

        await _accountsService.UpdateUserPassword(user, data.NewPassword);

        return NoContent();
    }

    [HttpPost]
    [Authorize]
    [Route("verification/resend")]
    public async Task<IActionResult> ResendVerificationEmail()
    {
        var userId = ulong.Parse(HttpContext.User.Claims.First(claim => claim.Type == Claims.UserId).Value);
        var user = await _accountsService.UserById(userId);

        if (user.EmailVerified) return BadRequest();

        await _accountsService.ResendVerificationEmail(user);

        return NoContent();
    }

    [HttpPost]
    [Authorize]
    [Route("verification")]
    public async Task<IActionResult> VerifyEmail([FromBody] VerifyEmailRequestData data)
    {
        var userId = ulong.Parse(HttpContext.User.Claims.First(claim => claim.Type == Claims.UserId).Value);
        var user = await _accountsService.UserById(userId);

        if (user.EmailVerified) return BadRequest();

        if (!await _accountsService.VerifyEmail(user, data.VerificationCode)) return BadRequest();

        return NoContent();
    }

    [HttpPost]
    [Authorize]
    [Route("otp")]
    public async Task<IActionResult> GetOtpStatus([FromBody] OtpRequestData data)
    {
        var userId = ulong.Parse(HttpContext.User.Claims.First(claim => claim.Type == Claims.UserId).Value);
        var user = await _accountsService.UserById(userId);

        if (!await _accountsService.VerifyUserPassword(user, data.Password)) return Forbid();

        if (await _accountsService.OtpEnabled(user))
            return Json(new
            {
                Enabled = true,
                BackupCodes = await _accountsService.OtpBackupCodes(user)
            });

        return Json(new
        {
            Enabled = false,
            Key = await _accountsService.GenerateOtpKey(user)
        });
    }

    [HttpPost]
    [Authorize]
    [Route("otp/enable")]
    public async Task<IActionResult> EnableOtp([FromBody] EnableOtpRequestData data)
    {
        var userId = ulong.Parse(HttpContext.User.Claims.First(claim => claim.Type == Claims.UserId).Value);
        var user = await _accountsService.UserById(userId);

        if (!await _accountsService.VerifyUserPassword(user, data.Password)) return Forbid();

        try
        {
            await _accountsService.EnableOtp(user, data.OtpCode);
            return NoContent();
        }
        catch (DBusException ex)
        {
            return this.ClientError(ex.ErrorName switch
            {
                "com.vicr123.accounts.Error.TwoFactorEnabled" => ParlanceClientError.TwoFactorAlreadyEnabled,
                "com.vicr123.accounts.Error.TwoFactorRequired" => ParlanceClientError.TwoFactorCodeIncorrect,
                _ => throw ex
            });
        }
    }

    [HttpPost]
    [Authorize]
    [Route("otp/disable")]
    public async Task<IActionResult> DisableOtp([FromBody] OtpRequestData data)
    {
        var userId = ulong.Parse(HttpContext.User.Claims.First(claim => claim.Type == Claims.UserId).Value);
        var user = await _accountsService.UserById(userId);

        if (!await _accountsService.VerifyUserPassword(user, data.Password)) return Forbid();

        try
        {
            await _accountsService.DisableOtp(user);
            return NoContent();
        }
        catch (DBusException ex)
        {
            return this.ClientError(ex.ErrorName switch
            {
                "com.vicr123.accounts.Error.TwoFactorDisabled" => ParlanceClientError.TwoFactorAlreadyDisabled,
                _ => throw ex
            });
        }
    }


    [HttpPost]
    [Authorize]
    [Route("otp/regenerate")]
    public async Task<IActionResult> RegenerateOtpCodes([FromBody] OtpRequestData data)
    {
        var userId = ulong.Parse(HttpContext.User.Claims.First(claim => claim.Type == Claims.UserId).Value);
        var user = await _accountsService.UserById(userId);

        if (!await _accountsService.VerifyUserPassword(user, data.Password)) return Forbid();

        try
        {
            await _accountsService.RegenerateBackupCodes(user);
            return NoContent();
        }
        catch (DBusException ex)
        {
            return this.ClientError(ex.ErrorName switch
            {
                "com.vicr123.accounts.Error.TwoFactorDisabled" => ParlanceClientError.TwoFactorIsDisabled,
                _ => throw ex
            });
        }
    }

    [HttpPost]
    [Authorize]
    [Route("keys")]
    public async Task<IActionResult> GetFidoKeys([FromBody] OtpRequestData data)
    {
        var userId = ulong.Parse(HttpContext.User.Claims.First(claim => claim.Type == Claims.UserId).Value);
        var user = await _accountsService.UserById(userId);

        if (!await _accountsService.VerifyUserPassword(user, data.Password)) return Forbid();

        return Json(await _accountsService.GetFidoKeys(user));
    }


    [HttpPost]
    [Authorize]
    [Route("keys/{key:int}/delete")]
    public async Task<IActionResult> DeleteFidoKey([FromBody] OtpRequestData data, [FromRoute] int key)
    {
        var userId = ulong.Parse(HttpContext.User.Claims.First(claim => claim.Type == Claims.UserId).Value);
        var user = await _accountsService.UserById(userId);

        if (!await _accountsService.VerifyUserPassword(user, data.Password)) return Forbid();

        var keys = await _accountsService.GetFidoKeys(user);
        if (keys.All(x => x.Id != key)) return NotFound();

        await _accountsService.DeleteFidoKey(user, key);
        return NoContent();
    }

    [HttpPost]
    [Authorize]
    [Route("keys/prepareRegister")]
    public async Task<IActionResult> PrepareRegisterKeys([FromBody] PrepareRegisterKeysRequestData data)
    {
        var userId = ulong.Parse(HttpContext.User.Claims.First(claim => claim.Type == Claims.UserId).Value);
        var user = await _accountsService.UserById(userId);

        if (!await _accountsService.VerifyUserPassword(user, data.Password)) return Forbid();

        var response =
            await _accountsService.PrepareRegisterFidoKey(user, data.AuthenticatorAttachmentType == "cross-platform");

        return Json(new
        {
            AuthenticatorOptions = JsonDocument.Parse(response).RootElement,
            Id = 0
        });
    }

    [HttpPost]
    [Authorize]
    [Route("keys/register")]
    public async Task<IActionResult> RegisterKeys([FromBody] RegisterKeysRequestData data)
    {
        var userId = ulong.Parse(HttpContext.User.Claims.First(claim => claim.Type == Claims.UserId).Value);
        var user = await _accountsService.UserById(userId);

        if (!await _accountsService.VerifyUserPassword(user, data.Password)) return Forbid();

        await _accountsService.FinishRegisterFidoKey(user, data.Response, data.Name);

        return NoContent();
    }

    public class CreateUserRequestData
    {
        public string Username { get; set; } = null!;
        public string EmailAddress { get; set; } = null!;
        public string Password { get; set; } = null!;
    }

    [JsonConverter(typeof(UserTokenRequestDataConverter))]
    public class UserTokenRequestData
    {
        public string Username { get; set; } = null!;
        public string Type { get; set; } = null!;
    }

    public class UserTokenRequestDataPassword : UserTokenRequestData
    {
        public string? Password { get; set; }
        public string? OtpToken { get; set; }
        public string? NewPassword { get; set; }
    }

    public class UserTokenRequestDataFido : UserTokenRequestData
    {
        public int? KeyTokenId { get; set; }
        public AuthenticatorAssertionRawResponse? KeyResponse { get; set; }
    }

    public class UserTokenRequestDataConverter : JsonConverter<UserTokenRequestData>
    {
        public override UserTokenRequestData? Read(ref Utf8JsonReader reader, Type typeToConvert,
            JsonSerializerOptions options)
        {
            using var doc = JsonDocument.ParseValue(ref reader);
            return doc.RootElement.GetProperty("type").GetString() switch
            {
                "password" => doc.RootElement.Deserialize<UserTokenRequestDataPassword>(options),
                "fido" => doc.RootElement.Deserialize<UserTokenRequestDataFido>(options),
                _ => throw new JsonException()
            };
        }

        public override void Write(Utf8JsonWriter writer, UserTokenRequestData value, JsonSerializerOptions options)
        {
            JsonSerializer.Serialize(writer, value, options);
        }
    }

    public class UsernameRequestData
    {
        public string Username { get; set; } = null!;
    }

    public class PerformResetRequestData
    {
        public string Username { get; set; } = null!;
        public string Type { get; set; } = null!;
        public IDictionary<string, object> Challenge { get; set; } = null!;
    }

    public class ChangeUsernameRequestData
    {
        public string NewUsername { get; set; } = null!;
        public string Password { get; set; } = null!;
    }

    public class ChangeEmailRequestData
    {
        public string NewEmail { get; set; } = null!;
        public string Password { get; set; } = null!;
    }

    public class ChangePasswordRequestData
    {
        public string NewPassword { get; set; } = null!;
        public string Password { get; set; } = null!;
    }

    public class VerifyEmailRequestData
    {
        public string VerificationCode { get; set; } = null!;
    }

    public class OtpRequestData
    {
        public string Password { get; set; } = null!;
    }

    public class EnableOtpRequestData : OtpRequestData
    {
        public string OtpCode { get; set; } = null!;
    }


    public class PrepareRegisterKeysRequestData
    {
        public string Password { get; set; } = null!;
        public string AuthenticatorAttachmentType { get; set; } = null!;
    }

    public class RegisterKeysRequestData
    {
        public int Id { get; set; }
        public string Password { get; set; } = null!;
        public string Name { get; set; } = null!;
        public JsonElement Response { get; set; }
    }
}