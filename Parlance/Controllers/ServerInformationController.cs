using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.Extensions.Options;

namespace Parlance.Controllers;

[ApiController]
[Route("api/[controller]")]
[EnableRateLimiting("limiter")]
public class ServerInformationController(IOptions<ParlanceOptions> parlanceOptions) : Controller
{
    [HttpGet]
    public Task<IActionResult> GetServerInformation()
    {
        return Task.FromResult<IActionResult>(Json(new
        {
            parlanceOptions.Value.ServerName,
            parlanceOptions.Value.AccountName
        }));
    }
}