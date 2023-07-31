using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using Parlance.Glossary.Services;

namespace Parlance.Controllers;

[ApiController]
[Route("api/[controller]")]
[EnableRateLimiting("limiter")]
public class GlossaryManagerController : Controller
{
    private readonly IGlossaryService _glossaryService;

    public GlossaryManagerController(IGlossaryService glossaryService)
    {
        _glossaryService = glossaryService;
    }

    [HttpGet]
    public Task<IActionResult> GetGlossaries()
    {
        return Task.FromResult<IActionResult>(Json(_glossaryService.Glossaries.Select(glossary => new {
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
            await _glossaryService.AddGlossary(requestData.Name);
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

    [HttpDelete]
    [Authorize(Policy = "Superuser")]
    [Route("{glossary:guid}")]
    public async Task<IActionResult> DeleteGlossary(Guid glossary)
    {
        try
        {
            await _glossaryService.DeleteGlossary(_glossaryService.GlossaryById(glossary));
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
}