using Microsoft.AspNetCore.Mvc;
using Parlance.CLDR;

namespace Parlance.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CldrController : Controller
{
    [HttpGet]
    [Route("{language}/plurals")]
    public Task<IActionResult> GetPluralRules(string language)
    {
        return Task.FromResult<IActionResult>(Json(language.ToLocale().PluralRules()));
    }
}