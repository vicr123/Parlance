using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Parlance.CldrData;

namespace Parlance.Controllers;

[ApiController]
[Route("api/[controller]")]
[EnableRateLimiting("limiter")]
public class CldrController : Controller
{
    [HttpGet]
    public Task<IActionResult> GetLocales()
    {
        return Task.FromResult<IActionResult>(Json(Locale.GetLocales().Select(locale => locale.ToDashed())));
    }

    [HttpGet]
    [Route("{language}/plurals")]
    public Task<IActionResult> GetPluralRules(string language)
    {
        return Task.FromResult<IActionResult>(Json(language.ToLocale().PluralRules()));
    }
}