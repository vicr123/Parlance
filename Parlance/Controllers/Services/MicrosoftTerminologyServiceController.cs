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

    // GET
    public async Task<IActionResult> Index()
    {
        var sources = new TranslationSources
        {
            TranslationSource.Terms,
            TranslationSource.UiStrings
        };

        var matches = await _terminology.GetTranslationsAsync("start button", "en-us", "vi-vn",
            SearchStringComparison.CaseInsensitive,
            SearchOperator.Contains, sources, false, 20, true, null);

        return Json(matches);
    }

    [Route("languages")]
    public async Task<IActionResult> SupportedLanguages()
    {
        return Json(await _terminology.GetLanguagesAsync());
    }

    [HttpPost]
    [Route("translations")]
    public async Task<IActionResult> Translations([FromBody] TranslationsData data)
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

    public class TranslationsData
    {
        public string Text { get; set; } = null!;
        public string From { get; set; } = null!;
        public string To { get; set; } = null!;
    }
}