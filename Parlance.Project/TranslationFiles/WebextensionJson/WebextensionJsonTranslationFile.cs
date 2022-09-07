using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;
using JetBrains.Annotations;
using Parlance.CldrData;
using Parlance.Project.Index;

namespace Parlance.Project.TranslationFiles.WebextensionJson;

[TranslationFileType("webext-json", ExpectedTranslationFileNameFormat.Underscored)]
public class WebextensionJsonTranslationFile : ParlanceTranslationFile, IParlanceMonoTranslationFile
{
    private string _baseFile = null!;
    private Locale _baseLocale = null!;
    private string _file = null!;
    private Locale _locale = null!;

    public WebextensionJsonTranslationFile(IParlanceSubprojectLanguage? subprojectLanguage,
        IParlanceIndexingService? indexingService) : base(subprojectLanguage, indexingService)
    {
    }

    public override string Hash { get; internal set; } = null!;
    public override IList<IParlanceTranslationFileEntry> Entries { get; internal set; } = null!;

    public static async Task<ParlanceTranslationFile> CreateAsync(string file, Locale locale, string baseFile,
        Locale baseLocale,
        IParlanceSubprojectLanguage? subprojectLanguage, IParlanceIndexingService? indexingService)
    {
        var translationFile = new WebextensionJsonTranslationFile(subprojectLanguage, indexingService);
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

        var doc = JsonDocument.Parse(fileContents);
        var baseDoc = await JsonDocument.ParseAsync(baseFileContents);

        var baseDocKeys = baseDoc.RootElement.EnumerateObject().Select(item =>
        {
            var tItem = item.Value.Deserialize<TranslationItem>();
            return (item.Name, tItem?.message ?? throw new InvalidOperationException()).ToTuple();
        }).ToDictionary(x => x.Item1, x => x.Item2);

        Entries = doc.RootElement.EnumerateObject().Select(item =>
        {
            var tItem = item.Value.Deserialize<TranslationItem>();

            return new WebextensionJsonTranslationFileEntry
            {
                Key = item.Name,
                Source = baseDocKeys[item.Name],
                Context = "Parlance",
                Description = tItem?.description,
                Placeholders = tItem?.placeholders,
                RequiresPluralisation = false,
                Translation = new List<TranslationWithPluralType>
                {
                    new()
                    {
                        PluralType = "singular",
                        TranslationContent = tItem?.message ?? throw new InvalidOperationException()
                    }
                }
            };
        }).Cast<IParlanceTranslationFileEntry>().ToList();
    }

    public override async Task Save()
    {
        var obj = Entries.Select(entry =>
        {
            var wxEntry = (WebextensionJsonTranslationFileEntry)entry;
            var obj = new JsonObject { { "message", entry.Translation[0].TranslationContent } };
            if (wxEntry.Description is not null) obj.Add("description", wxEntry.Description);
            if (wxEntry.Placeholders is not null) obj.Add("placeholders", wxEntry.Placeholders);
            return (entry.Key, obj);
        }).Aggregate(new JsonObject(), (acc, x) =>
        {
            acc.Add(x.Key, x.obj);
            return acc;
        });

        await File.WriteAllTextAsync(_file, obj.ToJsonString(new JsonSerializerOptions
        {
            WriteIndented = true
        }), Encoding.UTF8);
        await LoadFile(_file, _locale, _baseFile, _baseLocale);
        await base.Save();
    }

    private protected override Task UseAsBaseImpl(string filename, Locale locale)
    {
        _file = filename;
        _locale = locale;
        return Task.CompletedTask;
    }

    [UsedImplicitly]
    private class TranslationItem
    {
        // ReSharper disable InconsistentNaming
        public string? message { get; [UsedImplicitly] init; }
        public string? description { get; [UsedImplicitly] init; }

        public JsonObject? placeholders { get; [UsedImplicitly] init; }
        // ReSharper restore InconsistentNaming
    }
}