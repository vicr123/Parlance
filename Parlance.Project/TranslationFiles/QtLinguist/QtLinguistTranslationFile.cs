using System.Security.Cryptography;
using System.Text;
using System.Xml.Linq;
using Parlance.CldrData;
using Parlance.Project.Index;

namespace Parlance.Project.TranslationFiles.QtLinguist;

[TranslationFileType("qt", ExpectedTranslationFileNameFormat.Underscored)]
public class QtLinguistTranslationFile(
    IParlanceSubprojectLanguage? subprojectLanguage,
    IParlanceIndexingService? indexingService)
    : ParlanceTranslationFile(subprojectLanguage, indexingService), IParlanceDualTranslationFile
{
    private string _file = null!;
    private Locale _locale = null!;

    public override string Hash { get; internal set; } = null!;

    public override IList<IParlanceTranslationFileEntry> Entries { get; internal set; } = null!;

    public static async Task<ParlanceTranslationFile> CreateAsync(string file, Locale locale,
        IParlanceSubprojectLanguage? subprojectLanguage, IParlanceIndexingService? indexingService)
    {
        var translationFile = new QtLinguistTranslationFile(subprojectLanguage, indexingService);
        await translationFile.LoadFile(file, locale);
        return translationFile;
    }

    private async Task LoadFile(string file, Locale locale)
    {
        _file = file;
        _locale = locale;

        var fileContents = await File.ReadAllTextAsync(file);
        Hash = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(fileContents)));

        var pluralRules = locale.PluralRules().ToArray();

        var xmlDoc = XDocument.Parse(fileContents);
        Entries = xmlDoc.Descendants("message").Select(msg =>
        {
            var pluralDescendants = msg.Descendants("numerusform").ToList();
            return new QtLinguistTranslationFileEntry
            {
                RealKey = (string)msg.Element("source")! + "-" + (string)msg.Parent!.Element("name")!,
                Context = ((string)msg.Parent!.Element("name"))!,
                Source = (string)msg.Element("source")!,
                TsComment = (string?)msg.Element("comment"),
                TsExtraComment = (string?)msg.Element("extracomment"),
                Translation = msg.Attribute("numerus")?.Value == "yes"
                    ? pluralRules.Select((rule, idx2) => new TranslationWithPluralType
                    {
                        PluralType = rule.Category,
                        TranslationContent = pluralDescendants.Count > idx2 ? (string)pluralDescendants[idx2] : ""
                    }).ToList()
                    :
                    [
                        new()
                        {
                            PluralType = "singular",
                            TranslationContent = (string)msg.Element("translation")!
                        }
                    ],
                Type = (string?)msg.Element("translation")!.Attribute("type") ?? "finished",
                RequiresPluralisation = msg.Attribute("numerus")?.Value == "yes",
                Locations = msg.Elements("location")
                    .Where(loc => loc.Attribute("filename") is not null && loc.Attribute("line") is not null).Select(
                        loc =>
                            new QtLinguistTranslationFileEntry.Location((string)loc.Attribute("filename")!,
                                (string)loc.Attribute("line")!))
            };
        }).Where(entry => entry.Type != "vanished").Cast<IParlanceTranslationFileEntry>().ToList();
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

    public override async Task Save()
    {
        var pluralRules = _locale.PluralRules().ToList();

        var doc = new XDocument(
            new XElement("TS", new XAttribute("version", "2.1"), new XAttribute("language", _locale.ToUnderscored()),
                Entries.Cast<QtLinguistTranslationFileEntry>().GroupBy(entry => entry.Context).Select(context =>
                    new XElement("context",
                        new XElement("name", new XText(context.Key)),
                        context.Select(entry => new XElement("message",
                            entry.RequiresPluralisation
                                ? new XObject[]
                                {
                                    new XAttribute("numerus", "yes"),
                                    new XElement("translation",
                                        entry.Translation
                                            .OrderBy(x => pluralRules.FindIndex(r => r.Category == x.PluralType))
                                            .Select(translation => new XElement("numerusform",
                                                new XText(translation.TranslationContent)))
                                    )
                                }
                                : new XElement("translation",
                                    new XText(entry.Translation.Single(x => x.PluralType == "singular")
                                        .TranslationContent)),
                            entry.Locations.Select(location =>
                                new XElement("location", new XAttribute("filename", location.Filename),
                                    new XAttribute("line", location.Line))),
                            new XElement("source", new XText(entry.Source)),
                            new XElement("comment", entry.TsComment),
                            new XElement("extracomment", entry.TsExtraComment)
                        ))
                    )
                )
            )
        );

        {
            //TODO: What if two people write to the file at the same time?
            Directory.CreateDirectory(Path.GetDirectoryName(_file)!);
            await using var stream = File.Open(_file, FileMode.Create, FileAccess.Write, FileShare.ReadWrite);
            await doc.SaveAsync(stream, SaveOptions.None, CancellationToken.None);
        }

        await LoadFile(_file, _locale);
        await base.Save();
    }
}