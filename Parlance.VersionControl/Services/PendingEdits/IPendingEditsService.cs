using Parlance.CldrData;
using Parlance.Database.Interfaces;
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
    public Task<IEnumerable<Editor>> EditorsPendingEdits(IVcsable project);
    public IEnumerable<Locale> LocalesPendingEdits(IVcsable project);
    public Task ClearPendingEdits(IVcsable project);
}