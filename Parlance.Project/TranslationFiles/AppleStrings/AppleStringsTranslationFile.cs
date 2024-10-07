using System.Diagnostics;
using System.Security.Cryptography;
using System.Text;
using Parlance.CldrData;
using Parlance.Project.Index;

namespace Parlance.Project.TranslationFiles.AppleStrings;

[TranslationFileType("apple-strings", ExpectedTranslationFileNameFormat.Underscored)]
public class AppleStringsTranslationFile(
    IParlanceSubprojectLanguage? subprojectLanguage,
    IParlanceIndexingService? indexingService)
    : ParlanceTranslationFile(subprojectLanguage, indexingService), IParlanceMonoTranslationFile
{
        private string _baseFile = null!;
    private Locale _baseLocale = null!;
    private string _file = null!;
    private Locale _locale = null!;

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
        if (str.StartsWith('"') && str.EndsWith('"'))
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

        var baseDocKeys = baseFileContents.Where(l => !string.IsNullOrWhiteSpace(l)).Select(x =>
        {
            if (!x.EndsWith(";")) throw new("No trailing ; in Apple Strings file");
            var split = x.Split('=', StringSplitOptions.TrimEntries);
            Debug.Assert(split.Length == 2);
            return (Key: UnescapeString(split[0]), Source: UnescapeString(split[1][..^1].TrimEnd()));
        });
        var translationDocKeys = fileContents.Split("\n", StringSplitOptions.RemoveEmptyEntries).Select(x =>
        {
            if (!x.EndsWith(";")) throw new("No trailing ; in Apple Strings file");
            var splitter = x.IndexOf("=", StringComparison.Ordinal);
            return (UnescapeString(x[..splitter].Trim()), UnescapeString(x[(splitter + 1)..^1].Trim()));
        }).ToDictionary(x => x.Item1, x => x.Item2);

        Entries = baseDocKeys.Select(x => new AppleStringsTranslationFileEntry()
        {
            Key = x.Key,
            Source = x.Source,
            Context = Path.GetFileName(file),
            RequiresPluralisation = false,
            Comment = null,
            Translation = new List<TranslationWithPluralType>
            {
                new()
                {
                    PluralType = "singular",
                    TranslationContent = translationDocKeys.ContainsKey(x.Key) ? translationDocKeys[x.Key] : ""
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