using LibGit2Sharp;
using Microsoft.Extensions.Options;
using Parlance.Database;
using Parlance.Project;
using Parlance.Project.Index;
using Parlance.Services.RemoteCommunication;

namespace Parlance.Services.Projects;

public class ProjectService : IProjectService
{
    private readonly IOptions<ParlanceOptions> _parlanceOptions;
    private readonly IRemoteCommunicationService _remoteCommunicationService;
    private readonly IParlanceIndexingService _indexingService;
    private readonly ParlanceContext _dbContext;

    public ProjectService(IOptions<ParlanceOptions> parlanceOptions, IRemoteCommunicationService remoteCommunicationService, IParlanceIndexingService indexingService, ParlanceContext dbContext)
    {
        _parlanceOptions = parlanceOptions;
        _remoteCommunicationService = remoteCommunicationService;
        _indexingService = indexingService;
        _dbContext = dbContext;
    }
    
    public async Task RegisterProject(string cloneUrl, string branch, string name)
    {
        var systemName = name.ToLower().Replace(" ", "-");
        var directory = Path.Combine(_parlanceOptions.Value.RepositoryDirectory, systemName);
        var project = new Database.Models.Project
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
                catch (LibGit2SharpException)
                {
                    localBranch = repo.Branches.Where(b => b.IsRemote == false)
                        .Single(b => b.CanonicalName == $"refs/heads/{branch}");
                }
                
                repo.Checkout(localBranch.Tip.Tree, new []{"*"}, new CheckoutOptions()
                {
                    CheckoutModifiers = CheckoutModifiers.Force 
                });
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
        });

        try
        {
        
            //Run checks on the project
            await _indexingService.IndexProject(project.GetParlanceProject());
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
        _dbContext.Projects.Add(project);

        await _dbContext.SaveChangesAsync();
    }

    public Task<IEnumerable<Database.Models.Project>> Projects()
    {
        return Task.FromResult<IEnumerable<Database.Models.Project>>(_dbContext.Projects);
    }

    public Task<Database.Models.Project> ProjectBySystemName(string systemName)
    {
        try
        {
            return Task.FromResult(_dbContext.Projects.Single(project => project.SystemName == systemName));
        }
        catch (InvalidOperationException)
        {
            throw new ProjectNotFoundException();
        }
    }

    public async Task RemoveProject(Database.Models.Project project)
    {
        Directory.Delete(project.VcsDirectory, true);
        _dbContext.Projects.Remove(project);

        await _dbContext.SaveChangesAsync();
    }
}