using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Parlance.Services.Superuser;

namespace Parlance.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SuperusersController : Controller
{
    private readonly ISuperuserService _superuserService;

    public SuperusersController(ISuperuserService superuserService)
    {
        _superuserService = superuserService;
    }

    [Authorize(Policy = "Superuser")]
    [HttpGet]
    public async Task<IActionResult> GetSuperusers()
    {
        return Json(await _superuserService.Superusers());
    }

    public class AddSuperuserRequestData
    {
        public string Username { get; set; } = null!;
    }

    [Authorize(Policy = "Superuser")]
    [HttpPost]
    public async Task<IActionResult> AddSuperuser([FromBody] AddSuperuserRequestData data)
    {
        await _superuserService.GrantSuperuserPermissions(data.Username);
        return NoContent();
    }
    
    [Authorize(Policy = "Superuser")]
    [HttpDelete]
    [Route("{user}")]
    public async Task<IActionResult> RemoveSuperuser(string user)
    {
        if (!await _superuserService.IsSuperuser(user)) return NotFound();
        await _superuserService.RevokeSuperuserPermissions(user);
        return NoContent();
    }
}