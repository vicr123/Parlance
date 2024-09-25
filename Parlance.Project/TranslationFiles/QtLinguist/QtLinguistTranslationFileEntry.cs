using System.Security.Cryptography;
using System.Text;
using System.Xml.Linq;

namespace Parlance.Project.TranslationFiles.QtLinguist;

public class QtLinguistTranslationFileEntry : IParlanceTranslationFileEntry
{
    public record Location(string Filename, string Line);

    public string Key => Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(RealKey)));
    public required string RealKey { get; init; }
    public required string Source { get; init; }
    public required IList<TranslationWithPluralType> Translation { get; set; }
    public required string Context { get; init; }
    public bool RequiresPluralisation { get; set; }
    public required string? TsComment { get; init; }
    public required string? TsExtraComment { get; init; }
    public string? Comment => TsComment ?? TsExtraComment;
    public required IEnumerable<Location> Locations { get; init; }
    public required string Type { get; set; }
}