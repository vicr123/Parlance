using System.Security.Cryptography;
using System.Text;

namespace Parlance.Project.TranslationFiles.QtLinguist;

public class QtLinguistTranslationFileEntry : IParlanceTranslationFileEntry
{
    public record Location(string Filename, string Line);

    public string Key => Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(RealKey)));
    public string RealKey { get; init; } = null!;
    public string Source { get; init; } = null!;
    public IList<TranslationWithPluralType> Translation { get; set; } = null!;
    public string Context { get; init; } = null!;
    public bool RequiresPluralisation { get; init; }
    public IEnumerable<Location> Locations { get; init; } = null!;
}