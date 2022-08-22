using System.Security.Cryptography;
using System.Xml.Linq;

namespace Parlance.Project.TranslationFiles.QtLinguist;

public class QtLinguistTranslationFile : IParlanceTranslationFile
{
    private string _file = null!;

    public QtLinguistTranslationFile(string file)
    {
        LoadFile(file);
    }

    private void LoadFile(string file)
    {
        _file = file;
        Hash = Convert.ToHexString(SHA256.HashData(System.Text.Encoding.UTF8.GetBytes(file)));
        
        var xmlDoc = XDocument.Parse(File.ReadAllText(file));
        Entries = xmlDoc.Descendants("message").Select((msg, idx) => new QtLinguistTranslationFileEntry
        {
            Key = idx.ToString(),
            Context = ((string) msg.Parent!.Element("name"))!,
            Source = (string)msg.Element("source")!,
            Translation = msg.Attribute("numerus")?.Value == "yes" ? msg.Descendants("numerusform").Select(x => (string) x).ToList() : new List<string>()
            {
                (string) msg.Element("translation")!
            },
            RequiresPluralisation = msg.Attribute("numerus")?.Value == "yes",
            Locations = msg.Elements("location").Select(loc => new QtLinguistTranslationFileEntry.Location((string)loc.Attribute("filename")!, ((string)loc.Attribute("line"))!))
        }).Cast<IParlanceTranslationFileEntry>().ToList();
    }

    public string Hash { get; private set; } = null!;

    public IList<IParlanceTranslationFileEntry> Entries { get; private set; } = null!;

    public async Task Save()
    {
        var doc = new XDocument(
            new XElement("TS", new XAttribute("version", "2.1"),
                Entries.GroupBy(entry => entry.Context).Select(context =>
                    new XElement("context", 
                        new XElement("name", new XText(context.Key)),
                        context.Select(entry => new XElement("message",
                            entry.RequiresPluralisation
                                ? new XObject[] {
                                    new XAttribute("numerus", "yes"),
                                    new XElement("translation",
                                        entry.Translation.Select(translation => new XElement("numerusform", new XText(translation)))
                                    )
                                }
                                : new XElement("translation", new XText(entry.Translation.First())),
                            ((QtLinguistTranslationFileEntry) entry).Locations.Select(location => new XElement("location", new XAttribute("filename", location.Filename), new XAttribute("line", location.Line))),
                            new XElement("source", new XText(entry.Source))
                        ))
                    )
                )
            )
        );
        
        var stream = File.OpenWrite(_file + ".test");
        await doc.SaveAsync(stream, SaveOptions.None, CancellationToken.None);
    }
}