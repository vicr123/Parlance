using LibGit2Sharp;
using Microsoft.Extensions.Options;
using Parlance.Database;
using Parlance.Database.Models;
using Parlance.Services.RemoteCommunication;

namespace Parlance.Services.Projects;

public class ProjectService : IProjectService
{
    private readonly IOptions<ParlanceOptions> _parlanceOptions;
    private readonly IRemoteCommunicationService _remoteCommunicationService;
    private readonly ParlanceContext _dbContext;

    public ProjectService(IOptions<ParlanceOptions> parlanceOptions, IRemoteCommunicationService remoteCommunicationService, ParlanceContext dbContext)
    {
        _parlanceOptions = parlanceOptions;
        _remoteCommunicationService = remoteCommunicationService;
        _dbContext = dbContext;
    }
    
    public async Task RegisterProject(string cloneUrl, string branch, string name)
    {
        var systemName = name.ToLower().Replace(" ", "-");
        var directory = Path.Combine(_parlanceOptions.Value.RepositoryDirectory, systemName);
        var project = new Project
        {
            Name = name,
            SystemName = systemName,
            VcsDirectory = directory
        };
        
        await Task.Run(() =>
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
                catch (LibGit2SharpException ex)
                {
                    localBranch = repo.Branches.Where(b => b.IsRemote == false)
                        .Single(b => b.CanonicalName == $"refs/heads/{branch}");
                }
                
                repo.Checkout(localBranch.Tip.Tree, new []{"*"}, new CheckoutOptions()
                {
                    CheckoutModifiers = CheckoutModifiers.Force 
                });
            }
            catch (Exception ex)
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
        });
        _dbContext.Projects.Add(project);

        await _dbContext.SaveChangesAsync();
    }

    public Task<IEnumerable<Project>> Projects()
    {
        return Task.FromResult<IEnumerable<Project>>(_dbContext.Projects);
    }

    public Task<Project> ProjectBySystemName(string systemName)
    {
        return Task.FromResult(_dbContext.Projects.Single(project => project.SystemName == systemName));
    }

    public async Task RemoveProject(Project project)
    {
        Directory.Delete(project.VcsDirectory, true);
        _dbContext.Projects.Remove(project);

        await _dbContext.SaveChangesAsync();
    }
}