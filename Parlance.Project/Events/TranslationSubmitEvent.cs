using Parlance.Project.TranslationFiles;
using Parlance.Vicr123Accounts.Services;

namespace Parlance.Project.Events;

public class TranslationSubmitEvent
{
    public required IParlanceSubprojectLanguage SubprojectLanguage { get; set; }
    public required IParlanceTranslationFileEntry Entry { get; set; }
    public required User User { get; set; }
    
    public required Database.Models.Project Project { get; set; }
}
