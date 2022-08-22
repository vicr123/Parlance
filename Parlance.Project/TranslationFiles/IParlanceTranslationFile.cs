namespace Parlance.Project.TranslationFiles;

public interface IParlanceTranslationFile
{
    public string Hash { get; }
    
    public IList<IParlanceTranslationFileEntry> Entries { get; }

    public Task Save();
}