using LibGit2Sharp;
using MessagePipe;
using Parlance.Database;
using Parlance.Project;
using Parlance.Project.Exceptions;
using Parlance.VersionControl.Events;
using Parlance.VersionControl.Services.PendingEdits;

namespace Parlance.VersionControl.Services.VersionControl;

public class GitVersionControlService(
    IRemoteCommunicationService remoteCommunicationService,
    IPendingEditsService pendingEditsService,
    IAsyncPublisher<ProjectMetadataFileChangedEvent> projectMetadataFileChangedEventPublisher)
    : IVersionControlService
{
    private readonly Identity _identity = new("Parlance", "parlance@vicr123.com");

    public Task DownloadFromSource(string cloneUrl, string directory, string branch)
    {
        return Task.Run(() => DownloadFromSourceCore(cloneUrl, directory, branch));
    }

    public Task UpdateVersionControlMetadata(Database.Models.Project project)
    {
        return Task.Run(() => UpdateVersionControlMetadataCore(project));
    }

    public Task<VersionControlCommit?> SaveChangesToVersionControl(Database.Models.Project project)
    {
        return Task.Run(async () => await SaveChangesToVersionControlCore(project));
    }

    public Task PublishSavedChangesToSource(Database.Models.Project project)
    {
        return Task.Run(() => PublishSavedChangesToSourceCore(project));
    }

    public async Task ReconcileRemoteWithLocal(Database.Models.Project project)
    {
        IParlanceProject? oldProject = null;
        try
        {
            oldProject = project.GetParlanceProject();
        }
        catch (ParlanceJsonFileParseException)
        {
            // ignore
        }
        
        var projectMetaChanged = false;
        await Task.Run(() => ReconcileRemoteWithLocalCore(project, out projectMetaChanged));
        
        if (projectMetaChanged)
        {
            IParlanceProject? newProject = null;
            try
            {
                newProject = project.GetParlanceProject();
            }
            catch (ParlanceJsonFileParseException)
            {
                // ignore
            }

            await projectMetadataFileChangedEventPublisher.PublishAsync(new()
            {
                OldProject = oldProject,
                NewProject = newProject,
                ProjectSystemName = project.SystemName
            });
        }
    }

    public VersionControlStatus VersionControlStatus(Database.Models.Project project)
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

    public string CloneUrl(Database.Models.Project project)
    {
        using var repo = new Repository(project.VcsDirectory);
        return repo.Network.Remotes["origin"].Url;
    }

    public string CloneUrl(IParlanceProject project)
    {
        using var repo = new Repository(project.VcsDirectory);
        return repo.Network.Remotes["origin"].Url;
    }

    public Repository ProjectRepository(IParlanceProject project)
    {
        return new Repository(project.VcsDirectory);
    }

    private static void AbortPendingOperations(IRepository repo)
    {
        switch (repo.Info.CurrentOperation)
        {
            case CurrentOperation.Merge:
                repo.Reset(ResetMode.Hard);
                break;
            case CurrentOperation.Rebase:
            case CurrentOperation.RebaseInteractive:
            case CurrentOperation.RebaseMerge:
                repo.Rebase.Abort();
                break;
            case CurrentOperation.None:
            case CurrentOperation.Revert:
            case CurrentOperation.RevertSequence:
            case CurrentOperation.CherryPick:
            case CurrentOperation.CherryPickSequence:
            case CurrentOperation.Bisect:
            case CurrentOperation.ApplyMailbox:
            case CurrentOperation.ApplyMailboxOrRebase:
                break;
            default:
                throw new InvalidOperationException();
        }
    }

    private void ReconcileRemoteWithLocalCore(Database.Models.Project project, out bool projectMetaChanged)
    {
        using var repo = new Repository(project.VcsDirectory);
        var oldProjectMetaRevision = repo.Commits.QueryBy(".parlance.json", new CommitFilter
        {
            SortBy = CommitSortStrategies.Time | CommitSortStrategies.Topological
        }).FirstOrDefault()?.Commit.Sha;
        if (repo.RetrieveStatus().IsDirty) throw new DirtyWorkingTreeException();

        //Attempt to reconcile the remote by rebasing
        //If that fails (i.e. merge conflict) reconcile the remote by merging
        //If that still fails, fail the operation

        try
        {
            ReconcileRemoteWithLocalCoreRebase(repo);
        }
        catch (MergeConflictException)
        {
            ReconcileRemoteWithLocalCoreMerge(repo);
        }
        
        var projectMetaRevision = repo.Commits.QueryBy(".parlance.json", new CommitFilter
        {
            SortBy = CommitSortStrategies.Time | CommitSortStrategies.Topological
        }).FirstOrDefault()?.Commit.Sha;
        projectMetaChanged = projectMetaRevision != oldProjectMetaRevision;
    }

    private void ReconcileRemoteWithLocalCoreRebase(IRepository repo)
    {
        AbortPendingOperations(repo);

        var rebaseResult = repo.Rebase.Start(repo.Head, repo.Head.TrackedBranch, null, _identity, new RebaseOptions());
        if (rebaseResult.Status is RebaseStatus.Conflicts or RebaseStatus.Stop)
        {
            repo.Rebase.Abort();
            throw new MergeConflictException();
        }
    }

    private void ReconcileRemoteWithLocalCoreMerge(IRepository repo)
    {
        AbortPendingOperations(repo);

        var tip = repo.Head.Tip;
        var mergeResult = repo.Merge(repo.Head.TrackedBranch, new Signature(_identity, DateTimeOffset.Now));
        if (mergeResult.Status == MergeStatus.Conflicts)
        {
            repo.Reset(ResetMode.Hard, tip);
            throw new MergeConflictException();
        }
    }

    private void UpdateVersionControlMetadataCore(Database.Models.Project project)
    {
        using var repo = new Repository(project.VcsDirectory);
        repo.Network.Fetch("origin",
            repo.Network.Remotes["origin"].FetchRefSpecs.Select(refspec => refspec.Specification), new FetchOptions
            {
                CredentialsProvider = remoteCommunicationService.CredentialsHandler,
                CertificateCheck = remoteCommunicationService.CertificateCheckHandler
            });
    }

    private void DownloadFromSourceCore(string cloneUrl, string directory, string branch)
    {
        try
        {
            var repoPath = Repository.Clone(cloneUrl, directory,
                new CloneOptions
                {
                    FetchOptions =
                    {
                        CredentialsProvider = remoteCommunicationService.CredentialsHandler,
                        CertificateCheck = remoteCommunicationService.CertificateCheckHandler,
                        OnTransferProgress = _ => true
                    },
                    IsBare = false,
                });

            using var repo = new Repository(repoPath);
            Branch remoteBranch;
            try
            {
                remoteBranch = repo.Branches.Where(b => b.IsRemote)
                    .Single(b => b.CanonicalName == $"refs/remotes/origin/{branch}");
            }
            catch (InvalidOperationException)
            {
                throw new InvalidRefException($"Ref refs/remotes/origin/{branch} not found")
                {
                    Ref = $"refs/remotes/origin/{branch}"
                };
            }

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

            repo.Checkout(localBranch.Tip.Tree, ["*"], new CheckoutOptions
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

    private async Task<VersionControlCommit?> SaveChangesToVersionControlCore(Database.Models.Project project)
    {
        using var repo = new Repository(project.VcsDirectory);
        var status = repo.RetrieveStatus();

        AbortPendingOperations(repo);

        if (!status.IsDirty) return null;

        Commands.Stage(repo, "*");

        // TODO: Allow customizing the author of the committer
        // TODO: Express actual translation authors through Author
        var signature = new Signature(_identity, DateTimeOffset.Now);

        var pendingEdits = await pendingEditsService.EditorsPendingEdits(project);
        var pendingLocales = pendingEditsService.LocalesPendingEdits(project).ToList();

        var commitLines = new List<string>
        {
            pendingLocales.Any()
                ? $"Update Translations - {string.Join(", ", pendingLocales.Select(x => x.ToUnderscored()))}"
                : "Update Translations",
            ""
        };

        commitLines.AddRange(pendingEdits.Select(x => $"Co-Authored-By: {x.Name} <{x.Email}>"));

        var commit = repo.Commit(string.Join("\n", commitLines), signature, signature);
        await pendingEditsService.ClearPendingEdits(project);
        return new VersionControlCommit(commit);
    }

    private void PublishSavedChangesToSourceCore(Database.Models.Project project)
    {
        var repo = new Repository(project.VcsDirectory);
        var branch = repo.Head;
        repo.Network.Push(branch, new PushOptions
        {
            CredentialsProvider = remoteCommunicationService.CredentialsHandler,
            CertificateCheck = remoteCommunicationService.CertificateCheckHandler
        });
    }

    public Task DeleteUnpublishedChanges(Database.Models.Project project)
    {
        using var repo = new Repository(project.VcsDirectory);
        repo.Reset(ResetMode.Hard, repo.Head.Tip);
        return Task.CompletedTask;
    }
}