using Parlance.CldrData;
using Parlance.Project;
using Parlance.Vicr123Accounts.Services;

namespace Parlance.VersionControl.Services.PendingEdits;

public class Editor
{
    public string Name { get; set; } = null!;
    public string Email { get; set; } = null!;
}

public interface IPendingEditsService
{
    public Task RecordPendingEdit(IParlanceSubprojectLanguage parlanceSubprojectLanguage, User user);
    public Task<IEnumerable<Editor>> EditorsPendingEdits(Database.Models.Project project);
    public IEnumerable<Locale> LocalesPendingEdits(Database.Models.Project project);
    public Task ClearPendingEdits(Database.Models.Project project);
}