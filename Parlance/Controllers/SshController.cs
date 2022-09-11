using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Parlance.VersionControl.Services.SshKeyManagement;

namespace Parlance.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SshController : Controller
{
    private readonly ISshKeyManagementService _sshKeyManagementService;

    public SshController(ISshKeyManagementService sshKeyManagementService)
    {
        _sshKeyManagementService = sshKeyManagementService;
    }

    [Authorize(Policy = "Superuser")]
    [HttpGet]
    public async Task<IActionResult> GetSshPublicKey()
    {
        if (!await _sshKeyManagementService.SshKeyIsGenerated()) return NotFound();

        return Json(new
        {
            PublicKey = await _sshKeyManagementService.SshPublicKey()
        });
    }

    [Authorize(Policy = "Superuser")]
    [HttpPost]
    public async Task<IActionResult> GenerateSshPublicKey()
    {
        if (await _sshKeyManagementService.SshKeyIsGenerated()) return Conflict();

        await _sshKeyManagementService.GenerateNewSshKey();

        return Json(new
        {
            PublicKey = await _sshKeyManagementService.SshPublicKey()
        });
    }

    [Authorize(Policy = "Superuser")]
    [HttpDelete]
    public async Task<IActionResult> DeleteSshPublicKey()
    {
        if (!await _sshKeyManagementService.SshKeyIsGenerated()) return NotFound();
        await _sshKeyManagementService.DeleteSshKey();
        return NoContent();
    }
}