using LibGit2Sharp;
using Parlance.Project;

namespace Parlance.VersionControl.Services.VersionControl;

public class GitVersionControlService : IVersionControlService
{
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

    public Task SaveChangesToVersionControl(IParlanceProject project)
    {
        return Task.Run(() => SaveChangesToVersionControlCore(project));
    }

    public Task PublishSavedChangesToSource(IParlanceProject project)
    {
        return Task.Run(() => PublishSavedChangesToSourceCore(project));
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

    private void SaveChangesToVersionControlCore(IParlanceProject project)
    {
        using var repo = new Repository(project.VcsDirectory);
        var status = repo.RetrieveStatus();

        if (!status.IsDirty) return;

        Commands.Stage(repo, "*");

        // TODO: Allow customizing the author of the committer
        // TODO: Express actual translation authors through Author
        var signature = new Signature("Parlance", "parlance@vicr123.com", DateTimeOffset.Now);

        repo.Commit("Update Translations", signature, signature);
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