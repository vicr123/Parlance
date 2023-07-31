using Microsoft.EntityFrameworkCore;
using Parlance.Database;
using Parlance.Database.Models;

namespace Parlance.Glossary.Services;

public class GlossaryService : IGlossaryService
{
    private readonly ParlanceContext _parlanceContext;

    public GlossaryService(ParlanceContext parlanceContext)
    {
        _parlanceContext = parlanceContext;
    }
    
    public Database.Models.Glossary GlossaryById(Guid id)
    {
        return _parlanceContext.Glossaries.Include(x => x.Projects).Single(x => x.Id == id);
    }

    public IEnumerable<Database.Models.Glossary> Glossaries => _parlanceContext.Glossaries;

    public async Task AddGlossary(string name)
    {
        var glossary = new Database.Models.Glossary()
        {
            Name = name,
            CreatedDate = DateTimeOffset.UtcNow
        };

        _parlanceContext.Glossaries.Add(glossary);
        await _parlanceContext.SaveChangesAsync();
    }

    public async Task DeleteGlossary(Database.Models.Glossary glossary)
    {
        _parlanceContext.Glossaries.Remove(glossary);
        await _parlanceContext.SaveChangesAsync();
    }

    public async Task ConnectGlossary(Database.Models.Glossary glossary, Project project)
    {
        glossary.Projects.Add(project);
        _parlanceContext.Glossaries.Update(glossary);
        await _parlanceContext.SaveChangesAsync();
    }

    public async Task DisconnectGlossary(Database.Models.Glossary glossary, Project project)
    {
        if (!glossary.Projects.Remove(project))
        {
            throw new InvalidOperationException("The glossary is not connected to the project");
        }

        _parlanceContext.Glossaries.Update(glossary);
        await _parlanceContext.SaveChangesAsync();
    }
}
