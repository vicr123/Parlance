using Parlance.Project;

namespace Parlance.VersionControl.Services;

public interface IVersionControlService
{
    Task DownloadFromSource(string sourceUrl, string directory, string branch);
    Task SaveChangesToVersionControl(IParlanceProject project);
    Task PublishSavedChangesToSource(IParlanceProject project);
}