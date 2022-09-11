using LibGit2Sharp;
using Parlance.Project;

namespace Parlance.VersionControl.Services.VersionControl;

public class GitVersionControlService : IVersionControlService
{
    private readonly Identity _identity = new("Parlance", "parlance@vicr123.com");
    private readonly IRemoteCommunicationService _remoteCommunicationService;

    public GitVersionControlService(IRemoteCommunicationService remoteCommunicationService)
    {
        _remoteCommunicationService = remoteCommunicationService;
    }

    public Task DownloadFromSource(string cloneUrl, string directory, string branch)
    {
        return Task.Run(() => DownloadFromSourceCore(cloneUrl, directory, branch));
    }

    public Task UpdateVersionControlMetadata(IParlanceProject project)
    {
        return Task.Run(() => UpdateVersionControlMetadataCore(project));
    }

    public Task<VersionControlCommit?> SaveChangesToVersionControl(IParlanceProject project)
    {
        return Task.Run(() => SaveChangesToVersionControlCore(project));
    }

    public Task PublishSavedChangesToSource(IParlanceProject project)
    {
        return Task.Run(() => PublishSavedChangesToSourceCore(project));
    }

    public Task ReconcileRemoteWithLocal(IParlanceProject project)
    {
        return Task.Run(() => ReconcileRemoteWithLocalCore(project));
    }

    public VersionControlStatus VersionControlStatus(IParlanceProject project)
    {
        using var repo = new Repository(project.VcsDirectory);

        return new VersionControlStatus
        {
            LatestLocalCommit = new VersionControlCommit(repo.Head.Tip),
            LatestRemoteCommit = new VersionControlCommit(repo.Head.TrackedBranch.Tip),
            Ahead = repo.Head.TrackingDetails.AheadBy.GetValueOrDefault(),
            Behind = repo.Head.TrackingDetails.BehindBy.GetValueOrDefault(),
            ChangedFiles = repo.RetrieveStatus().Select(x => x.FilePath)
        };
    }

    private void ReconcileRemoteWithLocalCore(IParlanceProject project)
    {
        using var repo = new Repository(project.VcsDirectory);
        if (repo.RetrieveStatus().IsDirty) throw new DirtyWorkingTreeException();

        //Attempt to reconcile the remote by rebasing
        //If that fails (i.e. merge conflict) reconcile the remote by merging
        //If that still fails, fail the operation

        try
        {
            ReconcileRemoteWithLocalCoreRebase(repo);
        }
        catch (MergeConflictException ex)
        {
            ReconcileRemoteWithLocalCoreMerge(repo);
        }
    }

    private void ReconcileRemoteWithLocalCoreRebase(Repository repo)
    {
        var rebaseResult = repo.Rebase.Start(repo.Head, repo.Head.TrackedBranch, null, _identity, new RebaseOptions());
        if (rebaseResult.Status is RebaseStatus.Conflicts or RebaseStatus.Stop)
        {
            repo.Rebase.Abort();
            throw new MergeConflictException();
        }
    }

    private void ReconcileRemoteWithLocalCoreMerge(Repository repo)
    {
        var tip = repo.Head.Tip;
        var mergeResult = repo.Merge(repo.Head.TrackedBranch, new Signature(_identity, DateTimeOffset.Now));
        if (mergeResult.Status == MergeStatus.Conflicts)
        {
            repo.Reset(ResetMode.Hard, tip);
            throw new MergeConflictException();
        }
    }

    private void UpdateVersionControlMetadataCore(IParlanceProject project)
    {
        using var repo = new Repository(project.VcsDirectory);
        repo.Network.Fetch("origin",
            repo.Network.Remotes["origin"].FetchRefSpecs.Select(refspec => refspec.Specification), new FetchOptions
            {
                CredentialsProvider = _remoteCommunicationService.CredentialsHandler,
                CertificateCheck = _remoteCommunicationService.CertificateCheckHandler
            });
    }

    private void DownloadFromSourceCore(string cloneUrl, string directory, string branch)
    {
        try
        {
            var repoPath = Repository.Clone(cloneUrl, directory,
                new CloneOptions
                {
                    CredentialsProvider = _remoteCommunicationService.CredentialsHandler,
                    CertificateCheck = _remoteCommunicationService.CertificateCheckHandler,
                    IsBare = false,
                    OnTransferProgress = progress => { return true; }
                });

            using var repo = new Repository(repoPath);
            var remoteBranch = repo.Branches.Where(b => b.IsRemote)
                .Single(b => b.CanonicalName == $"refs/remotes/origin/{branch}");

            Branch localBranch;
            try
            {
                localBranch = repo.Branches.Add(branch, remoteBranch.Tip);
            }
            catch (LibGit2SharpException)
            {
                localBranch = repo.Branches.Where(b => b.IsRemote == false)
                    .Single(b => b.CanonicalName == $"refs/heads/{branch}");
            }

            repo.Checkout(localBranch.Tip.Tree, new[] { "*" }, new CheckoutOptions
            {
                CheckoutModifiers = CheckoutModifiers.Force
            });

            repo.Refs.UpdateTarget(repo.Refs.Head, localBranch.Reference);
            repo.Branches.Update(localBranch, u => u.Remote = "origin", u => u.UpstreamBranch = $"refs/heads/{branch}");
        }
        catch (Exception)
        {
            try
            {
                Directory.Delete(directory, true);
            }
            catch
            {
                // ignored
            }

            throw;
        }
    }

    private VersionControlCommit? SaveChangesToVersionControlCore(IParlanceProject project)
    {
        using var repo = new Repository(project.VcsDirectory);
        var status = repo.RetrieveStatus();

        if (!status.IsDirty) return null;

        Commands.Stage(repo, "*");

        // TODO: Allow customizing the author of the committer
        // TODO: Express actual translation authors through Author
        var signature = new Signature(_identity, DateTimeOffset.Now);

        var commit = repo.Commit("Update Translations", signature, signature);
        return new VersionControlCommit(commit);
    }

    private void PublishSavedChangesToSourceCore(IParlanceProject project)
    {
        var repo = new Repository(project.VcsDirectory);
        var branch = repo.Head;
        repo.Network.Push(branch, new PushOptions
        {
            CredentialsProvider = _remoteCommunicationService.CredentialsHandler,
            CertificateCheck = _remoteCommunicationService.CertificateCheckHandler
        });
    }
}