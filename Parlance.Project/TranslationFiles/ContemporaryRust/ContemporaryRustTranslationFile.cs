using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;
using JetBrains.Annotations;
using Parlance.CldrData;
using Parlance.Project.Index;

namespace Parlance.Project.TranslationFiles.ContemporaryRust;

[TranslationFileType("cntp-rs", ExpectedTranslationFileNameFormat.Dashed)]
public class ContemporaryRustTranslationFile(
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
        var translationFile = new ContemporaryRustTranslationFile(subprojectLanguage, indexingService);
        await translationFile.LoadFile(file, locale, baseFile, baseLocale);
        return translationFile;
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
        
        var meta = new Dictionary<string, MetaItem>();
        try
        {
            var metaFilePath = Path.Combine(Path.GetDirectoryName(file) ?? "", "meta.json");
            await using var metaFileContents = File.OpenRead(metaFilePath);
            meta = await JsonSerializer.DeserializeAsync<Dictionary<string, MetaItem>>(metaFileContents, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            }) ?? new Dictionary<string, MetaItem>();
        }
        catch
        {
            // ignored
        }

        var doc = JsonDocument.Parse(fileContents);
        var baseDoc = await JsonDocument.ParseAsync(baseFileContents);

        var inputDoc = doc.RootElement.EnumerateObject().ToDictionary(x => x.Name, x => x.Value);
        Entries = baseDoc.RootElement.EnumerateObject().Select(baseEntry =>
        {
            var item = inputDoc.GetValueOrDefault(baseEntry.Name);
            var metaItem = meta.GetValueOrDefault(baseEntry.Name);
            return new ContemporaryRustTranslationFileEntry
            {
                Key = baseEntry.Name,
                Source = baseEntry.Value.ValueKind switch
                {
                    JsonValueKind.String => baseEntry.Value.GetString() ?? throw new InvalidDataException("cntp-rs: base JSON not valid"),
                    JsonValueKind.Object => baseEntry.Value.EnumerateObject().Single(x => x.Name == "other").Value.GetString() ?? throw new InvalidDataException("cntp-rs: base JSON not valid"),
                    _ => throw new InvalidDataException("cntp-rs: base JSON not valid"),
                },
                Context = metaItem?.Context ?? "Parlance",
                RequiresPluralisation = baseEntry.Value.ValueKind == JsonValueKind.Object,
                Comment = metaItem?.Description,
                Translation = baseEntry.Value.ValueKind == JsonValueKind.Object ? locale.PluralRules().Select(rule =>
                {
                    string translationContent;
                    if (item.ValueKind == JsonValueKind.Object && item.TryGetProperty(rule.Category, out var content))
                    {
                        translationContent = content.GetString() ?? "";
                    }
                    else
                    {
                        translationContent = "";
                    }
                    return new TranslationWithPluralType
                    {
                        PluralType = rule.Category,
                        TranslationContent = translationContent,
                    };
                }).ToList() : [
                    new()
                    {
                        PluralType = "singular",
                        TranslationContent = item.ValueKind == JsonValueKind.String ? item.GetString() ?? "" : "",
                    },
                ],
            };
        }).Cast<IParlanceTranslationFileEntry>().ToList();
    }

    public override async Task Save()
    {
        var obj = Entries.Aggregate(new JsonObject(), (acc, entry) =>
        {
            if (entry.RequiresPluralisation)
            {
                acc.Add(entry.Key, entry.Translation.Aggregate(new JsonObject(), (acc1, t) =>
                {
                    acc1.Add(t.PluralType, t.TranslationContent);
                    return acc1;
                }));
            }
            else
            {
                acc.Add(entry.Key, entry.Translation.Single().TranslationContent);
            }
            return acc;
        });

        Directory.CreateDirectory(Path.GetDirectoryName(_file)!);
        await File.WriteAllTextAsync(_file, obj.ToJsonString(UnescapedJsonSerializerOptions));
        await LoadFile(_file, _locale, _baseFile, _baseLocale);
        await base.Save();
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
                    TranslationContent = string.Empty,
                });
        }

        return Task.CompletedTask;
    }
    
    [UsedImplicitly]
    private class MetaItem
    {
        public string? Context { get; [UsedImplicitly] init; }
        public required bool Plural { get; [UsedImplicitly] init; }
        public string? Description { get; [UsedImplicitly] init; }
    }
}