using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Parlance.Project.Checks;

namespace Parlance.Controllers;

[ApiController]
[Route("api/[controller]")]
[EnableRateLimiting("limiter")]
public class ChecksController(IParlanceChecks checks) : Controller
{
    [HttpPost]
    public Task<IActionResult> PerformChecks([FromBody] PerformChecksRequestData data)
    {
        return Task.FromResult<IActionResult>(Json(checks.CheckTranslation(data.Source, data.Translation,
            data.CheckSuite)));
    }

    public class PerformChecksRequestData
    {
        public string Source { get; set; } = null!;
        public string Translation { get; set; } = null!;
        public string CheckSuite { get; set; } = null!;
    }
}