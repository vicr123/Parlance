using System.Text.Json;
using System.Text.Json.Serialization;
using Fido2NetLib;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Parlance.Helpers;
using Parlance.Services.Permissions;
using Parlance.Services.Superuser;
using Parlance.Vicr123Accounts.Authentication;
using Parlance.Vicr123Accounts.Services;
using Parlance.Vicr123Accounts.Services.AttributionConsent;
using Tmds.DBus;

// ReSharper disable UnusedAutoPropertyAccessor.Global
// ReSharper disable AutoPropertyCanBeMadeGetOnly.Global

namespace Parlance.Controllers;

[ApiController]
[Route("api/[controller]")]
[EnableRateLimiting("limiter")]
public class UserController(
    IVicr123AccountsService accountsService,
    ISuperuserService superuserService,
    IPermissionsService permissionsService,
    IAttributionConsentService attributionConsentService)
    : Controller
{
    [Authorize]
    public async Task<IActionResult> GetUser()
    {
        var userId = ulong.Parse(HttpContext.User.Claims.First(claim => claim.Type == Claims.UserId).Value);
        var user = await accountsService.UserById(userId);

        var superuser = await superuserService.IsSuperuser(user.Username);

        return Json(new
        {
            user.Id, user.Username, user.Email, user.EmailVerified,
            Superuser = superuser,
            LanguagePermissions = await permissionsService.UserPermissions(user.Username)
                .SelectAwait(x => ValueTask.FromResult(x.ToDashed())).ToListAsync()
        });
    }

    [HttpPost]
    public async Task<IActionResult> CreateUser([FromBody] CreateUserRequestData data)
    {
        try
        {
            await accountsService.CreateUser(data.Username, data.Password, data.EmailAddress);
            var token = await accountsService.ProvisionTokenAsync(new ProvisionTokenParameters
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
            return Json(await accountsService.LoginMethods(data.Username));
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
    [EnableRateLimiting("login")]
    public async Task<IActionResult> GetUserToken([FromBody] UserTokenRequestData data)
    {
        try
        {
            var methods = await accountsService.LoginMethods(data.Username);
            if (!methods.Contains(data.Type)) return this.ClientError(ParlanceClientError.IncorrectParameters);

            switch (data.Type)
            {
                case "password":
                {
                    if (data is not UserTokenRequestDataPassword pwData)
                        return this.ClientError(ParlanceClientError.IncorrectParameters);

                    if (pwData.Password is null) return this.ClientError(ParlanceClientError.IncorrectParameters);

                    var token = await accountsService.ProvisionTokenAsync(new ProvisionTokenParameters
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
                        var (id, response) = await accountsService.GetFidoAssertionOptions(fidoData.Username);
                        return Json(new
                        {
                            Options = response,
                            Id = id
                        });
                    }

                    return Json(new
                    {
                        Token = await accountsService.ProvisionTokenViaFido(fidoData.KeyTokenId.Value,
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
        var user = await accountsService.UserByUsername(data.Username);
        return Json(
            (await accountsService.PasswordResetMethods(user)).Select(m => m.ToJsonSerializable())
        );
    }

    [HttpPost]
    [Route("reset")]
    public async Task<IActionResult> PerformReset([FromBody] PerformResetRequestData data)
    {
        var user = await accountsService.UserByUsername(data.Username);
        await accountsService.PerformPasswordReset(user, data.Type, data.Challenge.ToDictionary(item => item.Key,
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
        var user = await accountsService.UserById(userId);

        if (!await accountsService.VerifyUserPassword(user, data.Password)) return Forbid();

        user.Username = data.NewUsername;
        await accountsService.UpdateUser(user);

        return NoContent();
    }

    [HttpPost]
    [Authorize]
    [Route("email")]
    public async Task<IActionResult> ChangeEmail([FromBody] ChangeEmailRequestData data)
    {
        var userId = ulong.Parse(HttpContext.User.Claims.First(claim => claim.Type == Claims.UserId).Value);
        var user = await accountsService.UserById(userId);

        if (!await accountsService.VerifyUserPassword(user, data.Password)) return Forbid();

        user.Email = data.NewEmail;
        await accountsService.UpdateUser(user);

        return NoContent();
    }

    [HttpPost]
    [Authorize]
    [Route("password")]
    public async Task<IActionResult> ChangeEmail([FromBody] ChangePasswordRequestData data)
    {
        var userId = ulong.Parse(HttpContext.User.Claims.First(claim => claim.Type == Claims.UserId).Value);
        var user = await accountsService.UserById(userId);

        if (!await accountsService.VerifyUserPassword(user, data.Password)) return Forbid();

        await accountsService.UpdateUserPassword(user, data.NewPassword);

        return NoContent();
    }

    [HttpPost]
    [Authorize]
    [Route("verification/resend")]
    public async Task<IActionResult> ResendVerificationEmail()
    {
        var userId = ulong.Parse(HttpContext.User.Claims.First(claim => claim.Type == Claims.UserId).Value);
        var user = await accountsService.UserById(userId);

        if (user.EmailVerified) return BadRequest();

        await accountsService.ResendVerificationEmail(user);

        return NoContent();
    }

    [HttpPost]
    [Authorize]
    [Route("verification")]
    public async Task<IActionResult> VerifyEmail([FromBody] VerifyEmailRequestData data)
    {
        var userId = ulong.Parse(HttpContext.User.Claims.First(claim => claim.Type == Claims.UserId).Value);
        var user = await accountsService.UserById(userId);

        if (user.EmailVerified) return BadRequest();

        if (!await accountsService.VerifyEmail(user, data.VerificationCode)) return BadRequest();

        return NoContent();
    }

    [HttpPost]
    [Authorize]
    [Route("otp")]
    public async Task<IActionResult> GetOtpStatus([FromBody] OtpRequestData data)
    {
        var userId = ulong.Parse(HttpContext.User.Claims.First(claim => claim.Type == Claims.UserId).Value);
        var user = await accountsService.UserById(userId);

        if (!await accountsService.VerifyUserPassword(user, data.Password)) return Forbid();

        if (await accountsService.OtpEnabled(user))
            return Json(new
            {
                Enabled = true,
                BackupCodes = await accountsService.OtpBackupCodes(user)
            });

        return Json(new
        {
            Enabled = false,
            Key = await accountsService.GenerateOtpKey(user)
        });
    }

    [HttpPost]
    [Authorize]
    [Route("otp/enable")]
    public async Task<IActionResult> EnableOtp([FromBody] EnableOtpRequestData data)
    {
        var userId = ulong.Parse(HttpContext.User.Claims.First(claim => claim.Type == Claims.UserId).Value);
        var user = await accountsService.UserById(userId);

        if (!await accountsService.VerifyUserPassword(user, data.Password)) return Forbid();

        try
        {
            await accountsService.EnableOtp(user, data.OtpCode);
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
        var user = await accountsService.UserById(userId);

        if (!await accountsService.VerifyUserPassword(user, data.Password)) return Forbid();

        try
        {
            await accountsService.DisableOtp(user);
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
        var user = await accountsService.UserById(userId);

        if (!await accountsService.VerifyUserPassword(user, data.Password)) return Forbid();

        try
        {
            await accountsService.RegenerateBackupCodes(user);
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
        var user = await accountsService.UserById(userId);

        if (!await accountsService.VerifyUserPassword(user, data.Password)) return Forbid();

        return Json(await accountsService.GetFidoKeys(user));
    }


    [HttpPost]
    [Authorize]
    [Route("keys/{key:int}/delete")]
    public async Task<IActionResult> DeleteFidoKey([FromBody] OtpRequestData data, [FromRoute] int key)
    {
        var userId = ulong.Parse(HttpContext.User.Claims.First(claim => claim.Type == Claims.UserId).Value);
        var user = await accountsService.UserById(userId);

        if (!await accountsService.VerifyUserPassword(user, data.Password)) return Forbid();

        var keys = await accountsService.GetFidoKeys(user);
        if (keys.All(x => x.Id != key)) return NotFound();

        await accountsService.DeleteFidoKey(user, key);
        return NoContent();
    }

    [HttpPost]
    [Authorize]
    [Route("keys/prepareRegister")]
    public async Task<IActionResult> PrepareRegisterKeys([FromBody] PrepareRegisterKeysRequestData data)
    {
        var userId = ulong.Parse(HttpContext.User.Claims.First(claim => claim.Type == Claims.UserId).Value);
        var user = await accountsService.UserById(userId);

        if (!await accountsService.VerifyUserPassword(user, data.Password)) return Forbid();

        var response =
            await accountsService.PrepareRegisterFidoKey(user, data.AuthenticatorAttachmentType switch
            {
                "cross-platform" => IVicr123AccountsService.CrossPlatformAttachmentCrossPlatform,
                "platform" => IVicr123AccountsService.CrossPlatformAttachmentPlatform,
                _ => IVicr123AccountsService.CrossPlatformAttachmentAny
            });

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
        var user = await accountsService.UserById(userId);

        if (!await accountsService.VerifyUserPassword(user, data.Password)) return Forbid();

        await accountsService.FinishRegisterFidoKey(user, data.Response, data.Name);

        return NoContent();
    }

    [HttpGet]
    [Authorize]
    [Route("attribution/consent")]
    public async Task<IActionResult> AttributionConsentStatus()
    {
        var userId = ulong.Parse(HttpContext.User.Claims.First(claim => claim.Type == Claims.UserId).Value);
        var user = await accountsService.UserById(userId);

        return Json(new
        {
            ConsentProvided = attributionConsentService.HaveConsent(user),
            PreferredUserName = attributionConsentService.PreferredUserName(user)
        });
    }

    [HttpPost]
    [Authorize]
    [Route("attribution/consent")]
    public async Task<IActionResult> UpdateAttributionConsent([FromBody] UpdateAttributionConsentRequestData data)
    {
        var userId = ulong.Parse(HttpContext.User.Claims.First(claim => claim.Type == Claims.UserId).Value);
        var user = await accountsService.UserById(userId);

        if (!data.ConsentProvided && data.PreferredName is null)
            return this.ClientError(ParlanceClientError.IncorrectParameters);

        await attributionConsentService.SetConsentStatus(user, data.ConsentProvided);
        if (data.ConsentProvided) await attributionConsentService.SetPreferredUserName(user, data.PreferredName);

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

    public class UpdateAttributionConsentRequestData
    {
        public bool ConsentProvided { get; set; }
        public string? PreferredName { get; set; }
    }
}