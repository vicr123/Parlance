using System.Runtime.Versioning;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;
using Parlance.CldrData;
using Parlance.Project.Index;

namespace Parlance.Project.TranslationFiles.I18nextJson;

[TranslationFileType("i18next", ExpectedTranslationFileNameFormat.Dashed)]
[RequiresPreviewFeatures]
public class I18NextJsonTranslationFile : ParlanceTranslationFile, IParlanceMonoTranslationFile
{
    private readonly bool _isMono = true;
    private string _baseFile = null!;
    private Locale _baseLocale = null!;
    private string _file = null!;
    private Locale _locale = null!;

    public I18NextJsonTranslationFile(IParlanceSubprojectLanguage? subprojectLanguage,
        IParlanceIndexingService? indexingService) : base(subprojectLanguage, indexingService)
    {
        if (subprojectLanguage?.Subproject?.Options?.ContainsKey("isDual") is true)
            _isMono = !((JsonElement)subprojectLanguage.Subproject.Options["isDual"]).GetBoolean();
    }

    public override string Hash { get; internal set; } = null!;
    public override IList<IParlanceTranslationFileEntry> Entries { get; internal set; } = null!;

    public static async Task<ParlanceTranslationFile> CreateAsync(string file, Locale locale, string baseFile,
        Locale baseLocale,
        IParlanceSubprojectLanguage? subprojectLanguage, IParlanceIndexingService? indexingService)
    {
        var translationFile = new I18NextJsonTranslationFile(subprojectLanguage, indexingService);
        await translationFile.LoadFile(file, locale, baseFile, baseLocale);
        return translationFile;
    }

    private static (string, string) SplitKey(string key, Locale locale)
    {
        foreach (var rule in locale.PluralRules())
            if (key.EndsWith($"_{rule.Category}"))
                return (key.Remove(key.Length - rule.Category.Length - 1), rule.Category);

        return (key, string.Empty);
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

    private async Task LoadFile(string file, Locale locale, string baseFile, Locale baseLocale)
    {
        _file = file;
        _locale = locale;
        _baseFile = baseFile;
        _baseLocale = baseLocale;

        //TODO: Use a stream?

        var fileContents = await File.ReadAllTextAsync(file);
        await using var baseFileContents = File.OpenRead(baseFile);
        Hash = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(fileContents)));

        var doc = JsonDocument.Parse(fileContents);
        var baseDoc = await JsonDocument.ParseAsync(baseFileContents);

        var bases = baseDoc.RootElement.EnumerateObject()
            .GroupBy(x => SplitKey(x.Name, baseLocale).Item1)
            .ToDictionary(x => x.Key, x => x.ToList());

        var translationEntries = doc.RootElement.EnumerateObject().GroupBy(x => SplitKey(x.Name, locale).Item1)
            .ToDictionary(x => x.Key, x => x.ToList());

        Entries = bases.Keys.Select(key =>
        {
            var _ = translationEntries.TryGetValue(key, out var jsonEntries);
            var requiresPluralisation = !string.IsNullOrEmpty(SplitKey(bases[key][0].Name, baseLocale).Item2);

            List<TranslationWithPluralType> translationEntry;
            if (requiresPluralisation)
            {
                translationEntry = locale.PluralRules().Select(rule =>
                {
                    try
                    {
                        return new TranslationWithPluralType
                        {
                            PluralType = rule.Category,
                            TranslationContent =
                                jsonEntries?
                                    .Single(translation =>
                                        rule.Category == SplitKey(translation.Name, locale).Item2).Value
                                    .GetString()!
                        };
                    }
                    catch
                    {
                        return new TranslationWithPluralType
                        {
                            PluralType = rule.Category,
                            TranslationContent = string.Empty
                        };
                    }
                }).ToList();
            }
            else
            {
                try
                {
                    translationEntry = new List<TranslationWithPluralType>
                {
                    new()
                    {
                        PluralType = "singular",
                        TranslationContent = jsonEntries?.SingleOrDefault().Value.GetString() ?? string.Empty
                    }
                };
                }
                catch
                {
                    translationEntry = new List<TranslationWithPluralType>
                    {
                        new()
                        {
                            PluralType = "singular",
                            TranslationContent = string.Empty
                        }
                    };
                }
            }

            return new I18NextJsonTranslationFileEntry
            {
                RealKey = key,
                IsMono = _isMono,
                Source = _isMono ? bases[key][0].Value.GetString()! : key,
                Context = Path.GetFileName(file),
                RequiresPluralisation = requiresPluralisation,
                Translation = translationEntry
            };
        }).Cast<IParlanceTranslationFileEntry>().ToList();
    }

    public override async Task Save()
    {
        var selectResult = Entries.SelectMany(entry =>
        {
            var jsonEntry = (I18NextJsonTranslationFileEntry)entry;
            return jsonEntry.Translation.Select(translation =>
            {
                var key = jsonEntry.RealKey;
                if (jsonEntry.RequiresPluralisation) key += $"_{translation.PluralType}";
                return (key, translation.TranslationContent);
            });
        });

        var obj = selectResult.Aggregate(new JsonObject(), (acc, x) =>
        {
            acc.Add(x.Item1, x.Item2);
            return acc;
        });

        Directory.CreateDirectory(Path.GetDirectoryName(_file)!);
        await File.WriteAllTextAsync(_file, obj.ToJsonString(new JsonSerializerOptions
        {
            WriteIndented = true
        }), Encoding.UTF8);
        await LoadFile(_file, _locale, _baseFile, _baseLocale);
        await base.Save();
    }
}