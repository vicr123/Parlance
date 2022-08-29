using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Parlance.CLDR;
using Parlance.Services.Permissions;

namespace Parlance.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PermissionsController : Controller
{
    private readonly IPermissionsService _permissionsService;

    public PermissionsController(IPermissionsService permissionsService)
    {
        _permissionsService = permissionsService;
    }
    

    [Authorize(Policy = "Superuser")]
    [HttpGet]
    [Route("language/{language}")]
    public async Task<IActionResult> GetLocalePermissions(string language)
    {
        return Json(await _permissionsService.LocalePermissions(language.ToLocale()));
    }

    [Authorize(Policy = "Superuser")]
    [HttpPost]
    [Route("language/{language}/{username}")]
    public async Task<IActionResult> GrantLocale(string language, string username)
    {
        try
        {
            await _permissionsService.GrantLocalePermission(username, language.ToLocale());
            return NoContent();
        }
        catch (InvalidOperationException)
        {
            return BadRequest();
        }
    }
    
    [Authorize(Policy = "Superuser")]
    [HttpDelete]
    [Route("language/{language}/{username}")]
    public async Task<IActionResult> RevokeLocale(string language, string username)
    {
        try
        {
            await _permissionsService.RevokeLocalePermission(username, language.ToLocale());
            return NoContent();
        }
        catch (InvalidOperationException)
        {
            return BadRequest();
        }
    }
}