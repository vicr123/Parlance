using Parlance.CldrData;
using Parlance.Database.Models;

namespace Parlance.Glossary.Services;

public interface IGlossaryService
{
    IEnumerable<Database.Models.Glossary> Glossaries { get; }
    Task AddGlossary(string name);
    Task DeleteGlossary(Database.Models.Glossary glossary);
    Task ConnectGlossary(Database.Models.Glossary glossary, Project project);
    Database.Models.Glossary GlossaryById(Guid id);
    Task DisconnectGlossary(Database.Models.Glossary glossary, Project project);
    GlossaryItem GlossaryItemById(Guid id);
    Task Define(Database.Models.Glossary glossary, string term, string translation, Locale locale);
    Task RemoveDefinition(GlossaryItem item);
    IEnumerable<GlossaryItem> GetTerms(Database.Models.Glossary glossary, Locale locale);
}