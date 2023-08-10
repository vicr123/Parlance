using System.Security.Cryptography;
using System.Text;
using System.Xml.Linq;
using Parlance.CldrData;
using Parlance.Project.Index;
using Parlance.Project.TranslationFiles.QtLinguist;

namespace Parlance.Project.TranslationFiles.Gettext;

[TranslationFileType("gettext", ExpectedTranslationFileNameFormat.Underscored)]
public class GettextTranslationFile : ParlanceTranslationFile, IParlanceMonoTranslationFile
{
    private string _file = null!;
    private Locale _locale = null!;
    private string _baseFile = null!;
    private Locale _baseLocale = null!;

    public GettextTranslationFile(IParlanceSubprojectLanguage? subprojectLanguage,
        IParlanceIndexingService? indexingService) : base(subprojectLanguage, indexingService)
    {
    }

    public override string Hash { get; internal set; } = null!;

    private GettextTranslationFileEntry? EmptyEntry { get; set; }
    public override IList<IParlanceTranslationFileEntry> Entries { get; internal set; } = null!;
    
    public static async Task<ParlanceTranslationFile> CreateAsync(string file, Locale locale, string baseFile,
        Locale baseLocale,
        IParlanceSubprojectLanguage? subprojectLanguage, IParlanceIndexingService? indexingService)
    {
        var translationFile = new GettextTranslationFile(subprojectLanguage, indexingService);
        await translationFile.LoadFile(file, locale, baseFile, baseLocale);
        return translationFile;
    }

    private async Task LoadFile(string file, Locale locale, string baseFile, Locale baseLocale)
    {
        _file = file;
        _locale = locale;
        _baseFile = baseFile;
        _baseLocale = baseLocale;
        
        var fileContents = await File.ReadAllTextAsync(file);
        await using var baseFileContents = File.OpenRead(baseFile);
        Hash = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(fileContents)));

        var baseEntries = EntriesFromLines(await File.ReadAllLinesAsync(baseFile), baseLocale);
        var entries = EntriesFromLines(await File.ReadAllLinesAsync(file), locale);

        var mergedEntries = baseEntries.Select(entry =>
        {
            var newEntry = entries.FirstOrDefault(x => x.RealKey == entry.RealKey);
            if (newEntry is not null) return newEntry;
            if (!entry.RequiresPluralisation) return entry;

            entry.Translation.Clear();
            foreach (var pluralRule in locale.PluralRules())
                entry.Translation.Add(new()
                {
                    PluralType = pluralRule.Category,
                    TranslationContent = string.Empty
                });

            return entry;
        }).ToList();

        EmptyEntry = mergedEntries.SingleOrDefault(entry => string.IsNullOrEmpty(entry.Source));
        Entries = mergedEntries.Where(entry => !string.IsNullOrEmpty(entry.Source)).Cast<IParlanceTranslationFileEntry>().ToList();
    }

    private IEnumerable<GettextTranslationFileEntry> EntriesFromLines(IEnumerable<string> lines, Locale locale)
    {
        var pluralRules = locale.PluralRules();
        var currentEntry = new GettextTranslationFileEntry();
        var currentBuffer = new StringBuilder();
        var currentBufferType = GettextBufferType.None;

        foreach (var line in lines)
        {
            if (line.StartsWith("#"))
            {
                if (currentEntry.Source is not null)
                {
                    SaveBuffer();
                    yield return currentEntry;
                    
                    currentEntry = new GettextTranslationFileEntry();
                }
                
                currentEntry.PreLines.Add(line);
            } 
            else if (line.StartsWith("\""))
            {
                currentBuffer.Append(ExtractString(line));
            }
            else if (line.StartsWith("msgid_plural"))
            {
                SaveBuffer();
                currentBufferType = GettextBufferType.Id;
                currentEntry.RequiresPluralisation = true;

                currentBuffer.Append(ExtractString(line[13..]));
            }
            else if (line.StartsWith("msgid"))
            {
                SaveBuffer();
                currentBufferType = GettextBufferType.Id;
                
                currentBuffer.Append(ExtractString(line[6..]));
            }
            else if (line.StartsWith("msgctxt"))
            {
                SaveBuffer();
                currentBufferType = GettextBufferType.Context;
                    
                currentBuffer.Append(ExtractString(line[8..]));
            }
            else if (line.StartsWith("msgstr"))
            {
                SaveBuffer();
                
                if (line.StartsWith("msgstr["))
                {
                    // Plural
                    currentBufferType = GettextBufferType.PluralTranslation;
                    currentBuffer.Append(ExtractString(line[10..]));
                }
                else
                {
                    currentBufferType = GettextBufferType.Translation;
                    currentBuffer.Append(ExtractString(line[7..]));
                }
            }
        }
        
        SaveBuffer();
        if (!string.IsNullOrEmpty(currentEntry.Source)) yield return currentEntry;
        yield break;

        void SaveBuffer()
        {
            var finalString = currentBuffer.ToString().Replace("\\n", "\n");
            switch (currentBufferType)
            {
                case GettextBufferType.None:
                    break;
                case GettextBufferType.Id:
                    if (currentEntry.RequiresPluralisation)
                    {
                        currentEntry.PluralSource = finalString;                        
                    }
                    else
                    {
                        currentEntry.Source = finalString;
                    }
                    break;
                case GettextBufferType.Context:
                    currentEntry.RealContext = finalString;
                    break;
                case GettextBufferType.Translation:
                    currentEntry.Translation.Add(new TranslationWithPluralType()
                    {
                        PluralType = "singular",
                        TranslationContent = finalString
                    });
                    break;
                case GettextBufferType.PluralTranslation:
                    currentEntry.Translation.Add(new TranslationWithPluralType()
                    {
                        PluralType = pluralRules[currentEntry.Translation.Count].Category,
                        TranslationContent = finalString
                    });
                    break;
                default:
                    throw new ArgumentOutOfRangeException();
            }

            currentBufferType = GettextBufferType.None;
            currentBuffer = new StringBuilder();
        }

        string ExtractString(string quoted)
        {
            if (!quoted.StartsWith("\""))
            {
                throw new GettextFileFormatException("Expected string not found");
            }
            
            if (!quoted.EndsWith("\""))
            {
                throw new GettextFileFormatException("Unterminated \" at end of line");
            }

            return quoted[1..^1];
        }
    }

    private protected override Task UseAsBaseImpl(string filename, Locale locale)
    {
        _file = filename;
        _locale = locale;

        foreach (var entry in Entries)
        {
            if (!entry.RequiresPluralisation) continue;
            entry.Translation.Clear();

            foreach (var pluralRule in locale.PluralRules())
                entry.Translation.Add(new()
                {
                    PluralType = pluralRule.Category,
                    TranslationContent = string.Empty
                });
        }

        return Task.CompletedTask;
    }

    private IEnumerable<string> SplitEntryString(string instruction, string value)
    {
        if (!value.Contains('\n'))
        {
            yield return $"{instruction} \"{value}\"";
            yield break;
        }

        yield return $"{instruction} \"\"";
        foreach (var line in value.Split('\n'))
        {
            yield return $"\"{line}\\n\"";
        }
    }

    private IEnumerable<string> EntryToString(GettextTranslationFileEntry entry)
    {
        foreach (var pre in entry.PreLines) yield return pre;
        if (!string.IsNullOrEmpty(entry.RealContext)) foreach (var line in SplitEntryString("msgctxt", entry.RealContext)) yield return line;
        foreach (var line in SplitEntryString("msgid", entry.Source)) yield return line;

        if (entry.RequiresPluralisation)
        {
            foreach (var line in SplitEntryString("msgid_plural", entry.PluralSource)) yield return line;
            foreach (var line in entry.Translation.SelectMany((translation, i) =>
                         SplitEntryString($"msgstr[{i}]", translation.TranslationContent))) yield return line;
        }
        else
        {
            foreach (var line in SplitEntryString("msgstr", entry.Translation.First().TranslationContent)) yield return line;
        }
        yield return "";
    }

    public override async Task Save()
    {

        {
            //TODO: What if two people write to the file at the same time?
            Directory.CreateDirectory(Path.GetDirectoryName(_file)!);
            await using var stream = File.Open(_file, FileMode.Create, FileAccess.Write, FileShare.ReadWrite);
            var entryLines = Entries.Prepend(EmptyEntry).Cast<GettextTranslationFileEntry>().SelectMany(EntryToString);
            await File.WriteAllLinesAsync(_file, entryLines, Encoding.UTF8);
        }

        await LoadFile(_file, _locale, _baseFile, _baseLocale);
        await base.Save();
    }
}