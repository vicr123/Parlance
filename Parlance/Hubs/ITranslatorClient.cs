using Parlance.Project.TranslationFiles;

namespace Parlance.Hubs;

public interface ITranslatorClient
{
    Task TranslationUpdated(string newHash, Dictionary<string, IList<TranslationWithPluralType>> strings);
}