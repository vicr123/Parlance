using Parlance.CldrData;
using Parlance.Project.Index;

namespace Parlance.Project.TranslationFiles;

public abstract class ParlanceTranslationFile : IAsyncDisposable
{
    private readonly IParlanceSubprojectLanguage? _subprojectLanguage;
    private readonly IParlanceIndexingService? _indexingService;
    private bool _edited;

    protected ParlanceTranslationFile(IParlanceSubprojectLanguage? subprojectLanguage, IParlanceIndexingService? indexingService)
    {
        _subprojectLanguage = subprojectLanguage;
        _indexingService = indexingService;
    }

    public virtual Task Save()
    {
        _edited = true;
        return Task.CompletedTask;
    }
    
    public async ValueTask DisposeAsync()
    {
        if (_edited && _indexingService is not null && _subprojectLanguage is not null)
        {
            await _indexingService.IndexTranslationFile(_subprojectLanguage);
        }
    }

    public abstract string Hash { get; internal set; }
    public abstract IList<IParlanceTranslationFileEntry> Entries { get; internal set; }
}