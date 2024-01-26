using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using Parlance.CldrData;
using Parlance.Database.Models;
using Parlance.Glossary.Services;

namespace Parlance.Controllers;

[ApiController]
[Route("api/[controller]")]
[EnableRateLimiting("limiter")]
public class GlossaryManagerController(IGlossaryService glossaryService) : Controller
{
    [HttpGet]
    public Task<IActionResult> GetGlossaries()
    {
        return Task.FromResult<IActionResult>(Json(glossaryService.Glossaries.Select(glossary => new {
            glossary.Id, glossary.Name, glossary.CreatedDate,
            UsedByProjects = glossary.Projects.Count
        })));
    }

    [HttpPost]
    [Authorize(Policy = "Superuser")]
    public async Task<IActionResult> AddGlossary([FromBody] AddGlossaryRequestData requestData)
    {
        try
        {
            await glossaryService.AddGlossary(requestData.Name);
            return NoContent();
        }
        catch (DbUpdateException ex) when (ex.InnerException is PostgresException
                                           {
                                               SqlState: PostgresErrorCodes.UniqueViolation
                                           })
        {
            return Conflict();
        }
    }
    
    
    [HttpGet]
    [Route("{glossary:guid}")]
    public Task<IActionResult> GetAllTerms(Guid glossary)
    {
        try
        {
            var g = glossaryService.GlossaryById(glossary);

            return Task.FromResult<IActionResult>(Json(glossaryService.GetTerms(g, null).Select(term => new
            {
                term.Id,
                term.Term,
                term.Translation,
                term.PartOfSpeech,
                Lang = Locale.FromDatabaseRepresentation(term.Language)!.ToDashed()
            })));
        }
        catch (InvalidOperationException)
        {
            return Task.FromResult<IActionResult>(NotFound());
        }
    }

    [HttpDelete]
    [Authorize(Policy = "Superuser")]
    [Route("{glossary:guid}")]
    public async Task<IActionResult> DeleteGlossary(Guid glossary)
    {
        try
        {
            await glossaryService.DeleteGlossary(glossaryService.GlossaryById(glossary));
            return NoContent();
        }
        catch (InvalidOperationException)
        {
            return NotFound();
        }
    }
    
    [HttpGet]
    [Route("{glossary:guid}/{language}")]
    public Task<IActionResult> GetTerms(Guid glossary, string language)
    {
        try
        {
            var g = glossaryService.GlossaryById(glossary);
            var locale = language.ToLocale();

            return Task.FromResult<IActionResult>(Json(glossaryService.GetTerms(g, locale).Select(term => new
            {
                term.Id,
                term.Term,
                term.Translation,
                term.PartOfSpeech,
                Lang = Locale.FromDatabaseRepresentation(term.Language)!.ToDashed()
            })));
        }
        catch (InvalidOperationException)
        {
            return Task.FromResult<IActionResult>(NotFound());
        }
    }
    
    [Authorize(Policy = "LanguageEditor")]
    [HttpPost]
    [Route("{glossary:guid}/{language}")]
    public async Task<IActionResult> DefineTerm(Guid glossary, string language, [FromBody] DefineTermRequestData data)
    {
        try
        {
            if (string.IsNullOrEmpty(data.Term) || string.IsNullOrEmpty(data.Translation))
            {
                return BadRequest();
            }
            
            var g = glossaryService.GlossaryById(glossary);
            var locale = language.ToLocale();
            await glossaryService.Define(g, data.Term, data.PartOfSpeech, data.Translation, locale);
            return NoContent();
        }
        catch (InvalidOperationException)
        {
            return NotFound();
        }
    }
    
    [Authorize(Policy = "LanguageEditor")]
    [HttpDelete]
    [Route("{glossary:guid}/{language}/{term:guid}")]
    public async Task<IActionResult> DeleteTerm(Guid glossary, string language, Guid term)
    {
        try
        {
            var glossaryItem = glossaryService.GlossaryItemById(term);
            if (glossaryItem.GlossaryId != glossary || language.ToLocale().ToDatabaseRepresentation() != glossaryItem.Language)
            {
                return NotFound();
            }
            
            await glossaryService.RemoveDefinition(glossaryService.GlossaryItemById(term));
            return NoContent();
        }
        catch (InvalidOperationException)
        {
            return NotFound();
        }
    }

    public class AddGlossaryRequestData
    {
        public required string Name { get; set; }
    }

    public class DefineTermRequestData
    {
        public required string Term { get; set; }
        public required string Translation { get; set; }
        public required PartOfSpeech PartOfSpeech { get; set; }
    }
}