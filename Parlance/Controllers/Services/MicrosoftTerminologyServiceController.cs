using Microsoft.AspNetCore.Mvc;
using ServiceReference;

namespace Parlance.Controllers.Services;

[Route("api/services/microsoft")]
public class MicrosoftTerminologyServiceController : Controller
{
    private readonly Terminology _terminology;

    public MicrosoftTerminologyServiceController(Terminology terminology)
    {
        _terminology = terminology;
    }

    [Route("languages")]
    public async Task<IActionResult> SupportedLanguages()
    {
        try
        {
            return Json(await _terminology.GetLanguagesAsync());
        }
        catch (TimeoutException)
        {
            return StatusCode(504);
        }
    }

    [HttpPost]
    [Route("translations")]
    public async Task<IActionResult> Translations([FromBody] TranslationsData data)
    {
        try
        {
            var sources = new TranslationSources
            {
                TranslationSource.Terms,
                TranslationSource.UiStrings
            };

            var matches = await _terminology.GetTranslationsAsync(data.Text, data.From, data.To,
                SearchStringComparison.CaseInsensitive,
                SearchOperator.Contains, sources, false, 20, true, null);

            return Json(matches);
        }
        catch (TimeoutException)
        {
            return StatusCode(504);
        }
    }

    public class TranslationsData
    {
        public string Text { get; set; } = null!;
        public string From { get; set; } = null!;
        public string To { get; set; } = null!;
    }
}