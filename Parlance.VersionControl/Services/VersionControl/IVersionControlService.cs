using LibGit2Sharp;
using Parlance.Database.Interfaces;
using Parlance.Project;

namespace Parlance.VersionControl.Services.VersionControl;

public class MergeConflictException : Exception;

public class DirtyWorkingTreeException : Exception;

public class NoUpstreamException : Exception;

public class WebhookStatus
{
    public DateTimeOffset ReceivedAt { get; init; }
    public string Source { get; init; }
    public string Payload { get; init; }
}

public class VersionControlCommit(Commit commit)
{
    public string CommitIdentifier { get; } = commit.Sha;
    public string CommitMessage { get; } = commit.Message;
}

public class VersionControlStatus
{
    public VersionControlCommit LatestLocalCommit { get; init; }
    public VersionControlCommit LatestRemoteCommit { get; set; }
    public int Ahead { get; init; }
    public int Behind { get; init; }
    public IEnumerable<string> ChangedFiles { get; init; }
    public WebhookStatus? LastWebhook { get; init; }
}

public interface IVersionControlService
{
    Task DownloadFromSource(string sourceUrl, string directory, string branch);
    Task DownloadFromSourceBare(string sourceUrl, string directory);
    Task CreateWorktree(IVcsable project, string directory, string branch);
    Task DeleteWorktree(IVcsable project, string branch);
    Task UpdateVersionControlMetadata(IVcsable project);
    Task<VersionControlCommit?> SaveChangesToVersionControl(IVcsable project);
    Task DeleteUnpublishedChanges(IVcsable project);
    Task PublishSavedChangesToSource(IVcsable project);
    Task ReconcileRemoteWithLocal(IVcsable project);
    Task<VersionControlStatus> VersionControlStatus(IVcsable project);
    string CloneUrl(IVcsable project);
    string CloneUrl(IParlanceProject project);
    string BranchName(IVcsable project);
}