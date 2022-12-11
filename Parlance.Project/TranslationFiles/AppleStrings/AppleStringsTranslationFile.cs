using System.Security.Cryptography;
using System.Text;
using Parlance.CldrData;
using Parlance.Project.Index;

namespace Parlance.Project.TranslationFiles.AppleStrings;

[TranslationFileType("apple-strings", ExpectedTranslationFileNameFormat.Underscored)]
public class AppleStringsTranslationFile : ParlanceTranslationFile, IParlanceMonoTranslationFile
{
        private string _baseFile = null!;
    private Locale _baseLocale = null!;
    private string _file = null!;
    private Locale _locale = null!;

    public AppleStringsTranslationFile(IParlanceSubprojectLanguage? subprojectLanguage,
        IParlanceIndexingService? indexingService) : base(subprojectLanguage, indexingService)
    {
    }

    public override string Hash { get; internal set; } = null!;
    public override IList<IParlanceTranslationFileEntry> Entries { get; internal set; } = null!;

    public static async Task<ParlanceTranslationFile> CreateAsync(string file, Locale locale, string baseFile,
        Locale baseLocale,
        IParlanceSubprojectLanguage? subprojectLanguage, IParlanceIndexingService? indexingService)
    {
        var translationFile = new AppleStringsTranslationFile(subprojectLanguage, indexingService);
        await translationFile.LoadFile(file, locale, baseFile, baseLocale);
        return translationFile;
    }

    private string UnescapeString(string str)
    {
        if (str.StartsWith("\"") && str.EndsWith("\""))
        {
            str = str[1..^1];
        }
        
        return str.Replace("\\r", "\r").Replace("\\n", "\n").Replace("\\\"", "\"").Replace("\\\\", "\\");
    }

    private string EscapeString(string str)
    {
        return $"\"{str.Replace("\\", "\\\\").Replace("\n", "\\n").Replace("\r", "\\r").Replace("\"", "\\\"")}\"";
    }

    private async Task LoadFile(string file, Locale locale, string baseFile, Locale baseLocale)
    {
        _file = file;
        _locale = locale;
        _baseFile = baseFile;
        _baseLocale = baseLocale;

        var fileContents = await File.ReadAllTextAsync(file);
        var baseFileContents = await File.ReadAllLinesAsync(baseFile);
        Hash = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(fileContents)));

        var baseDocKeys = baseFileContents.Select(x =>
        {
            if (!x.EndsWith(";")) throw new("No trailing ; in Apple Strings file");
            var splitter = x.IndexOf("=", StringComparison.Ordinal);
            return (UnescapeString(x[..splitter].Trim()), UnescapeString(x[(splitter + 1)..^1].Trim()));
        });
        var translationDocKeys = fileContents.Split("\n", StringSplitOptions.RemoveEmptyEntries).Select(x =>
        {
            if (!x.EndsWith(";")) throw new("No trailing ; in Apple Strings file");
            var splitter = x.IndexOf("=", StringComparison.Ordinal);
            return (UnescapeString(x[..splitter].Trim()), UnescapeString(x[(splitter + 1)..^1].Trim()));
        }).ToDictionary(x => x.Item1, x => x.Item2);

        Entries = baseDocKeys.Select(x => new AppleStringsTranslationFileEntry()
        {
            Key = x.Item1,
            Source = x.Item2,
            Context = Path.GetFileName(file),
            RequiresPluralisation = false,
            Translation = new List<TranslationWithPluralType>
            {
                new()
                {
                    PluralType = "singular",
                    TranslationContent = translationDocKeys.ContainsKey(x.Item1) ? translationDocKeys[x.Item1] : ""
                }
            }
        }).Cast<IParlanceTranslationFileEntry>().ToList();
    }

    public override async Task Save()
    {
        var lines = Entries.Select(entry =>
            $"{EscapeString(entry.Key)} = {EscapeString(entry.Translation[0].TranslationContent)};");

        Directory.CreateDirectory(Path.GetDirectoryName(_file)!);
        await File.WriteAllLinesAsync(_file, lines);
        await LoadFile(_file, _locale, _baseFile, _baseLocale);
        await base.Save();
    }

    private protected override Task UseAsBaseImpl(string filename, Locale locale)
    {
        _file = filename;
        _locale = locale;

        foreach (var entry in Entries)
        {
            entry.Translation = new List<TranslationWithPluralType>
            {
                new()
                {
                    PluralType = "singular",
                    TranslationContent = ""
                }
            };
        }

        return Task.CompletedTask;
    }
}