using Parlance.CldrData;
using Parlance.Project.Index;

using System.Text.Encodings.Web;
using System.Text.Json;
using System.Text.Unicode;

namespace Parlance.Project.TranslationFiles;

public abstract class ParlanceTranslationFile(
    IParlanceSubprojectLanguage? subprojectLanguage,
    IParlanceIndexingService? indexingService)
    : IAsyncDisposable
{
    private bool _edited;

    protected static readonly JsonSerializerOptions UnescapedJsonSerializerOptions = new()
    {
        WriteIndented = true,
        Encoder = JavaScriptEncoder.Create(UnicodeRanges.All)
    };

    public abstract string Hash { get; internal set; }
    public abstract IList<IParlanceTranslationFileEntry> Entries { get; internal set; }

    public async ValueTask DisposeAsync()
    {
        if (_edited && indexingService is not null && subprojectLanguage is not null)
            await indexingService.IndexTranslationFile(subprojectLanguage);
    }

    public virtual Task Save()
    {
        _edited = true;
        return Task.CompletedTask;
    }

    public async Task UseAsBaseFor(string filename, Locale locale)
    {
        foreach (var entry in Entries)
        foreach (var translation in entry.Translation)
            translation.TranslationContent = "";

        await UseAsBaseImpl(filename, locale);
        await Save();
    }

    private protected abstract Task UseAsBaseImpl(string filename, Locale locale);
}