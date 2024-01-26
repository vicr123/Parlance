using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Parlance.VersionControl.Services.SshKeyManagement;

namespace Parlance.Controllers;

[ApiController]
[Route("api/[controller]")]
[EnableRateLimiting("limiter")]
public class SshController(ISshKeyManagementService sshKeyManagementService) : Controller
{
    [Authorize(Policy = "Superuser")]
    [HttpGet]
    public async Task<IActionResult> GetSshPublicKey()
    {
        if (!await sshKeyManagementService.SshKeyIsGenerated()) return NotFound();

        return Json(new
        {
            PublicKey = await sshKeyManagementService.SshPublicKey()
        });
    }

    [Authorize(Policy = "Superuser")]
    [HttpPost]
    public async Task<IActionResult> GenerateSshPublicKey()
    {
        if (await sshKeyManagementService.SshKeyIsGenerated()) return Conflict();

        await sshKeyManagementService.GenerateNewSshKey();

        return Json(new
        {
            PublicKey = await sshKeyManagementService.SshPublicKey()
        });
    }

    [Authorize(Policy = "Superuser")]
    [HttpDelete]
    public async Task<IActionResult> DeleteSshPublicKey()
    {
        if (!await sshKeyManagementService.SshKeyIsGenerated()) return NotFound();
        await sshKeyManagementService.DeleteSshKey();
        return NoContent();
    }
}