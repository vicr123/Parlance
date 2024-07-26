using LibGit2Sharp;
using Parlance.Project;

namespace Parlance.VersionControl.Services.VersionControl;

public class MergeConflictException : Exception;

public class DirtyWorkingTreeException : Exception;

public class BranchNotFoundException : InvalidOperationException
{
    public required string Branch { get; set; }
}

public class VersionControlCommit(Commit commit)
{
    public string CommitIdentifier { get; } = commit.Sha;
    public string CommitMessage { get; } = commit.Message;
}

public class VersionControlStatus
{
    public required VersionControlCommit LatestLocalCommit { get; init; }
    public required VersionControlCommit LatestRemoteCommit { get; set; }
    public required int Ahead { get; init; }
    public required int Behind { get; init; }
    public required IEnumerable<string> ChangedFiles { get; init; }
    public required string Branch { get; init; }
    
    public required string UpstreamUrl { get; set; }
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
    Task CheckoutBranch(Database.Models.Project project, string branch);
}