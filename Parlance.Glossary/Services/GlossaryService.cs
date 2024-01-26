using Microsoft.EntityFrameworkCore;
using Parlance.CldrData;
using Parlance.Database;
using Parlance.Database.Models;

namespace Parlance.Glossary.Services;

public class GlossaryService(ParlanceContext parlanceContext) : IGlossaryService
{
    public Database.Models.Glossary GlossaryById(Guid id)
    {
        return parlanceContext.Glossaries.Include(x => x.Projects).Single(x => x.Id == id);
    }

    public GlossaryItem GlossaryItemById(Guid id)
    {
        return parlanceContext.GlossaryItems.Single(x => x.Id == id);
    }

    public IEnumerable<Database.Models.Glossary> Glossaries => parlanceContext.Glossaries.Include(x => x.Projects);

    public async Task AddGlossary(string name)
    {
        var glossary = new Database.Models.Glossary()
        {
            Name = name,
            CreatedDate = DateTimeOffset.UtcNow
        };

        parlanceContext.Glossaries.Add(glossary);
        await parlanceContext.SaveChangesAsync();
    }

    public async Task DeleteGlossary(Database.Models.Glossary glossary)
    {
        parlanceContext.Glossaries.Remove(glossary);
        await parlanceContext.SaveChangesAsync();
    }

    public List<Database.Models.Glossary> ConnectedGlossaries(Project project) =>
        parlanceContext.Projects.Include(x => x.Glossaries).Single(x => x == project).Glossaries;

    public async Task ConnectGlossary(Database.Models.Glossary glossary, Project project)
    {
        glossary.Projects.Add(project);
        parlanceContext.Glossaries.Update(glossary);
        await parlanceContext.SaveChangesAsync();
    }

    public async Task DisconnectGlossary(Database.Models.Glossary glossary, Project project)
    {
        if (!glossary.Projects.Remove(project))
        {
            throw new InvalidOperationException("The glossary is not connected to the project");
        }

        parlanceContext.Glossaries.Update(glossary);
        await parlanceContext.SaveChangesAsync();
    }

    public async Task Define(Database.Models.Glossary glossary, string term, PartOfSpeech partOfSpeech, string translation, Locale locale)
    {
        var glossaryItem = new GlossaryItem
        {
            Language = locale.ToDatabaseRepresentation(),
            Term = term,
            Translation = translation,
            Glossary = glossary,
            PartOfSpeech = partOfSpeech
        };
        parlanceContext.GlossaryItems.Add(glossaryItem);
        await parlanceContext.SaveChangesAsync();
    }

    public IEnumerable<GlossaryItem> GetTerms(Database.Models.Glossary glossary, Locale? locale)
    {
        return parlanceContext.GlossaryItems.Where(item =>
            item.GlossaryId == glossary.Id).Where(item => locale == null || item.Language == locale.ToDatabaseRepresentation());
    }

    public async Task RemoveDefinition(GlossaryItem item)
    {
        parlanceContext.GlossaryItems.Remove(item);
        await parlanceContext.SaveChangesAsync();
    }

    public IEnumerable<GlossaryItem> SearchGlossaryByProject(Project project, Locale locale, string? term)
    {
        return parlanceContext.Projects.Include(x => x.Glossaries).ThenInclude(x => x.GlossaryItems).Single(x => x.Id == project.Id).Glossaries.SelectMany(glossary => glossary.GlossaryItems)
            .Where(glossaryItem =>
            {
                if (!string.IsNullOrEmpty(term))
                {
                    if (glossaryItem.Term.Contains(term, StringComparison.InvariantCultureIgnoreCase) ||
                        glossaryItem.Translation.Contains(term, StringComparison.InvariantCultureIgnoreCase)) return true;
                }
                
                return Locale.FromDatabaseRepresentation(glossaryItem.Language)?.IsSupersetOf(locale) is true;
            })
            .DistinctBy(x => x.Id);
    }
}
