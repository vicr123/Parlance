using System.Security.Cryptography;
using System.Text;

namespace Parlance.Project.TranslationFiles.Gettext;

public class GettextTranslationFileEntry : IParlanceTranslationFileEntry
{
    public string Key => Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(RealKey)));
    public string RealKey => Context + "." + Source;
    public string PluralSource { get; set; } = "";
    public string? Source { get; set; } = null;
    public IList<TranslationWithPluralType> Translation { get; set; } = new List<TranslationWithPluralType>();
    public string Context => RealContext ?? "No Context";
    public string? RealContext { get; set; }
    public IList<string> PreLines { get; set; } = new List<string>();
    public bool RequiresPluralisation { get; set; }
}
