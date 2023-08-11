namespace Parlance.Project.TranslationFiles.Gettext;

public class GettextMetadata
{
    private readonly Dictionary<string, string> _metadata = new();
    
    public GettextMetadata(string metadataContents)
    {
        foreach (var line in metadataContents.Split('\n'))
        {
            if (!line.Contains(':')) continue;
            _metadata.Add(line[..line.IndexOf(":", StringComparison.Ordinal)], line[line.IndexOf(":", StringComparison.Ordinal)..].TrimStart());
        }        
    }

    public void Add(string key, string value)
    {
        _metadata.Add(key, value);
    }

    public override string ToString()
    {
        return string.Join('\n', _metadata.Select(meta => $"{meta.Key}: {meta.Value}"));
    }
}