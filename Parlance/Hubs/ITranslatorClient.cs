using Parlance.Project.TranslationFiles;

namespace Parlance.Hubs;

public interface ITranslatorClient
{
    Task TranslationUpdated(string project, string subproject, string language, string newHash, Dictionary<string, IList<TranslationWithPluralType>> strings);
}