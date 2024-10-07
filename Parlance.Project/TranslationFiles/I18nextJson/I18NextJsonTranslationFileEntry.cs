using System.Security.Cryptography;
using System.Text;

namespace Parlance.Project.TranslationFiles.I18nextJson;

public class I18NextJsonTranslationFileEntry : IParlanceTranslationFileEntry
{
    public bool IsMono { get; set; }
    public string RealKey { get; set; } = null!;
    public string Key => IsMono ? RealKey : Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(RealKey)));
    public string Source { get; set; } = null!;
    public IList<TranslationWithPluralType> Translation { get; set; } = null!;
    public string Context { get; set; } = null!;
    public bool RequiresPluralisation { get; set; }
    public string? Comment { get; init; }
}