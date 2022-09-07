using LibGit2Sharp;
using Microsoft.Extensions.Logging;
using Parlance.Project;

namespace Parlance.VersionControl.Services;

public class GitVersionControlService : IVersionControlService
{
    private readonly IRemoteCommunicationService _remoteCommunicationService;

    public GitVersionControlService(IRemoteCommunicationService remoteCommunicationService)
    {
        _remoteCommunicationService = remoteCommunicationService;
    }

    public Task DownloadFromSource(string cloneUrl, string directory, string branch)
        => Task.Run(() => DownloadFromSourceCore(cloneUrl, directory, branch));

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
                    OnTransferProgress = progress =>
                    {
                        return true;
                    }
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

    public Task SaveChangesToVersionControl(IParlanceProject project)
        => Task.Run(() => SaveChangesToVersionControlCore(project));

    private void SaveChangesToVersionControlCore(IParlanceProject project)
    {
        var repo = new Repository(project.VcsDirectory);
        var status = repo.RetrieveStatus();

        if (!status.IsDirty)
        {
            return;
        }

        Commands.Stage(repo, "*");

        // TODO: Allow customizing the author of the committer
        // TODO: Express actual translation authors through Author
        var signature = new Signature("Parlance", "parlance@vicr123.com", DateTimeOffset.Now);

        repo.Commit("Update Translations", signature, signature);
    }

    public Task PublishSavedChangesToSource(IParlanceProject project)
        => Task.Run(() => PublishSavedChangesToSourceCore(project));

    private void PublishSavedChangesToSourceCore(IParlanceProject project)
    {
        var repo = new Repository(project.VcsDirectory);
        var branch = repo.Head;
        /*var config = Configuration.BuildFrom(Path.Join(project.VcsDirectory, ".git", "config"));
        config.
        repo.Network.Push(branch.up)*/
        repo.Network.Push(branch, new PushOptions
        { 
            CredentialsProvider = _remoteCommunicationService.CredentialsHandler,
            CertificateCheck = _remoteCommunicationService.CertificateCheckHandler,
        });
    }

}