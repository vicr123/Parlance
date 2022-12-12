using System.Runtime.Versioning;
using System.Security.Cryptography;
using System.Text;
using System.Xml.Linq;
using Parlance.CldrData;
using Parlance.Project.Index;

namespace Parlance.Project.TranslationFiles.DotNetResources;

[TranslationFileType("resx", ExpectedTranslationFileNameFormat.Underscored)]
public class DotNetResourcesTranslationFile : ParlanceTranslationFile, IParlanceMonoTranslationFile
{
    private string _baseFile;
    private Locale _baseLocale;
    private string _file;
    private Locale _locale;
    private IList<XElement> _resheaders;

    private XElement _schema;

    public DotNetResourcesTranslationFile(IParlanceSubprojectLanguage? subprojectLanguage,
        IParlanceIndexingService? indexingService) : base(subprojectLanguage, indexingService)
    {
    }

    public override string Hash { get; internal set; }
    public override IList<IParlanceTranslationFileEntry> Entries { get; internal set; }

    public static async Task<ParlanceTranslationFile> CreateAsync(string file, Locale locale, string baseFile,
        Locale baseLocale,
        IParlanceSubprojectLanguage? subprojectLanguage, IParlanceIndexingService? indexingService)
    {
        var translationFile = new DotNetResourcesTranslationFile(subprojectLanguage, indexingService);
        await translationFile.LoadFile(file, locale, baseFile, baseLocale);
        return translationFile;
    }

    private protected override Task UseAsBaseImpl(string filename, Locale locale)
    {
        _file = filename;
        _locale = locale;

        foreach (var entry in Entries)
        {
            entry.Translation.Clear();
            entry.Translation.Add(new()
            {
                PluralType = "singular",
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
        var baseFileContents = await File.ReadAllTextAsync(baseFile);
        Hash = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(fileContents)));

        var doc = XDocument.Parse(fileContents);
        var baseDoc = XDocument.Parse(baseFileContents);

        var bases = baseDoc.Root.Descendants("data")
            .ToDictionary(x => x.Attribute("name").Value, x => (string)x.Descendants("value").Single());
        var translationEntries = doc.Root.Descendants("data")
            .ToDictionary(x => x.Attribute("name").Value, x => (string)x.Descendants("value").Single());

        _schema = doc.Root.Descendants(XNamespace.Get("http://www.w3.org/2001/XMLSchema") + "schema").Single();
        _resheaders = doc.Root.Descendants("resheader").ToList();

        Entries = bases.Keys.Select(key =>
        {
            var haveTranslationEntry = translationEntries.TryGetValue(key, out var translationValue);

            var translationEntry = new List<TranslationWithPluralType>();
            if (haveTranslationEntry)
                translationEntry.Add(new TranslationWithPluralType
                {
                    PluralType = "singluar",
                    TranslationContent = translationValue!
                });
            else
                translationEntry.Add(new()
                {
                    PluralType = "singular",
                    TranslationContent = string.Empty
                });

            return new DotNetResourcesTranslationFileEntry
            {
                Key = key,
                Source = bases[key],
                Context = Path.GetFileName(file),
                RequiresPluralisation = false,
                Translation = translationEntry
            };
        }).Cast<IParlanceTranslationFileEntry>().ToList();
    }

    public override async Task Save()
    {
        var doc = new XDocument(
            new XElement("root",
                _schema,
                _resheaders,
                Entries.Select(entry => new XElement("data", new XAttribute("name", entry.Key),
                    new XAttribute(XNamespace.Get("http://www.w3.org/XML/1998/namespace") + "space", "preserve"),
                    new XElement("value", new XText(entry.Translation.First().TranslationContent))))
            )
        );

        {
            //TODO: What if two people write to the file at the same time?
            Directory.CreateDirectory(Path.GetDirectoryName(_file)!);
            await using var stream = File.Open(_file, FileMode.Create, FileAccess.Write, FileShare.ReadWrite);
            await doc.SaveAsync(stream, SaveOptions.None, CancellationToken.None);
        }

        await LoadFile(_file, _locale, _baseFile, _baseLocale);
        await base.Save();
    }
}