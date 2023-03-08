using LibGit2Sharp;
using Parlance.Project;

namespace Parlance.VersionControl.Services.VersionControl;

public class MergeConflictException : Exception
{
}

public class DirtyWorkingTreeException : Exception
{
}

public class VersionControlCommit
{
    public VersionControlCommit(Commit commit)
    {
        CommitIdentifier = commit.Sha;
        CommitMessage = commit.Message;
    }

    public string CommitIdentifier { get; }
    public string CommitMessage { get; }
}

public class VersionControlStatus
{
    public VersionControlCommit LatestLocalCommit { get; init; }
    public VersionControlCommit LatestRemoteCommit { get; set; }
    public int Ahead { get; init; }
    public int Behind { get; init; }
    public IEnumerable<string> ChangedFiles { get; init; }
}

public interface IVersionControlService
{
    Task DownloadFromSource(string sourceUrl, string directory, string branch);
    Task UpdateVersionControlMetadata(Database.Models.Project project);
    Task<VersionControlCommit?> SaveChangesToVersionControl(Database.Models.Project project);
    Task DeleteUnpublishedChanges(Database.Models.Project project);
    Task PublishSavedChangesToSource(Database.Models.Project project);
    Task ReconcileRemoteWithLocal(Database.Models.Project project);
    VersionControlStatus VersionControlStatus(Database.Models.Project project);
    string CloneUrl(Database.Models.Project project);
    string CloneUrl(IParlanceProject project);
}