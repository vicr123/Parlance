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
}