using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;
using Json.Path;
using Parlance.CldrData;
using Parlance.Project.Index;

namespace Parlance.Project.TranslationFiles.VueI18n;

[TranslationFileType("vue-i18n", ExpectedTranslationFileNameFormat.Dashed)]
// ReSharper disable once InconsistentNaming
public class VueI18nTranslationFile(
    IParlanceSubprojectLanguage? subprojectLanguage,
    IParlanceIndexingService? indexingService)
    : ParlanceTranslationFile(subprojectLanguage, indexingService), IParlanceMonoTranslationFile
{
    private const string pluralSeparator = " | ";
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
        var translationFile = new VueI18nTranslationFile(subprojectLanguage, indexingService);
        await translationFile.LoadFile(file, locale, baseFile, baseLocale);
        return translationFile;
    }

    private IEnumerable<JsonPath> BuildJsonPaths(JsonNode node)
    {
        switch (node)
        {
            case JsonObject obj:
            {
                foreach (var (_, innerNode) in obj)
                {
                    foreach (var x in BuildJsonPaths(innerNode!)) yield return x;
                }

                break;
            }
            case JsonArray arr:
            {
                foreach (var value in arr)
                {
                    foreach (var x in BuildJsonPaths(value!)) yield return x;
                }

                break;
            }
            case JsonValue:
                switch (node.GetValue<JsonElement>().ValueKind)
                {
                    case JsonValueKind.Object:
                        foreach (var (_, innerNode) in node.AsObject())
                        {
                            foreach (var x in BuildJsonPaths(innerNode!)) yield return x;
                        }
                        break;
                    case JsonValueKind.Array:
                        foreach (var value in node.AsArray())
                        {
                            foreach (var x in BuildJsonPaths(value!)) yield return x;
                        }
                        break;
                    case JsonValueKind.String:
                        yield return JsonPath.Parse(node.GetPath());
                        break;
                    case JsonValueKind.Number:
                    case JsonValueKind.Undefined:
                    case JsonValueKind.Null:
                    case JsonValueKind.True:
                    case JsonValueKind.False:
                    default:
                        break;
                }

                break;
        }
    }

    private async Task LoadFile(string file, Locale locale, string baseFile, Locale baseLocale)
    {
        _file = file;
        _locale = locale;
        _baseFile = baseFile;
        _baseLocale = baseLocale;

        //TODO: Use a stream?

        var fileContents = await File.ReadAllTextAsync(file);
        var baseFileContents = await File.ReadAllTextAsync(baseFile);
        Hash = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(fileContents)));

        var fileNode = JsonNode.Parse(fileContents);
        var baseFileNode = JsonNode.Parse(baseFileContents);
        if (baseFileNode is null || fileNode is null)
        {
            throw new InvalidDataException("vue-i18n: input JSON not valid");
        }
        
        var pluralRules = locale.PluralRules().ToArray();
        
        var paths = BuildJsonPaths(baseFileNode);
        Entries = paths.Select(path =>
        {
            var source = path.Evaluate(baseFileNode).Matches!.First().Value!.GetValue<string>();
            var translation = path.Evaluate(fileNode).Matches?.FirstOrDefault()?.Value?.GetValue<string>();
            var isPlural = source.Contains("{count}");

            var contextParts = path.ToString().Split(".");
            var context = string.Join(".", contextParts[..^1]);

            return new VueI18nTranslationFileEntry
            {
                Key = path.ToString(),
                Source = isPlural ? source.Split(pluralSeparator).Last() : source,
                Translation = isPlural
                    ? translation?.Split(pluralSeparator).Where((x, i) => pluralRules.Length > i).Select(
                        (x, i) => new TranslationWithPluralType
                        {
                            TranslationContent = x,
                            PluralType = pluralRules[i].Category
                        }).ToList() ?? new List<TranslationWithPluralType>
                    {
                        new()
                        {
                            TranslationContent = "",
                            PluralType = pluralRules.Last().Category
                        }
                    }
                    : new List<TranslationWithPluralType>
                    {
                        new()
                        {
                            TranslationContent = translation ?? "",
                            PluralType = "singular"
                        }
                    },
                Context = context,
                RequiresPluralisation = isPlural
            };
        }).Cast<IParlanceTranslationFileEntry>().ToList();
    }

    public override async Task Save()
    {
        var pluralRules = _locale.PluralRules().ToList();
        var baseFileContents = await File.ReadAllTextAsync(_baseFile);
        var baseFileNode = JsonNode.Parse(baseFileContents)!;

        foreach (var entry in Entries)
        {
            string value;
            if (entry.RequiresPluralisation)
            {
                value = string.Join(pluralSeparator, entry.Translation
                    .OrderBy(x => pluralRules.FindIndex(r => r.Category == x.PluralType))
                    .Select(x => x.TranslationContent));
            }
            else
            {
                value = entry.Translation.First().TranslationContent;
            }

            var node = JsonPath.Parse(entry.Key).Evaluate(baseFileNode).Matches![0].Value!;
            node.Parent![node.GetPath().Split(".").Last()] = value;
        }
        
        Directory.CreateDirectory(Path.GetDirectoryName(_file)!);
        await File.WriteAllTextAsync(_file, baseFileNode.ToJsonString(UnescapedJsonSerializerOptions));
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
                    TranslationContent = string.Empty
                });
        }

        return Task.CompletedTask;
    }
}