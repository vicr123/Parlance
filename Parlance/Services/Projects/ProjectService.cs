using Microsoft.Extensions.Options;
using Parlance.Database;
using Parlance.Project;
using Parlance.Project.Index;
using Parlance.VersionControl.Services;
using Parlance.VersionControl.Services.VersionControl;

namespace Parlance.Services.Projects;

public class ProjectService : IProjectService
{
    private readonly ParlanceContext _dbContext;
    private readonly IParlanceIndexingService _indexingService;
    private readonly ILogger<ProjectService> _logger;
    private readonly IOptions<ParlanceOptions> _parlanceOptions;
    private readonly IRemoteCommunicationService _remoteCommunicationService;
    private readonly IVersionControlService _versionControlService;

    public ProjectService(IOptions<ParlanceOptions> parlanceOptions,
        IRemoteCommunicationService remoteCommunicationService,
        IParlanceIndexingService indexingService,
        ParlanceContext dbContext,
        IVersionControlService versionControlService,
        ILogger<ProjectService> logger)
    {
        _parlanceOptions = parlanceOptions;
        _remoteCommunicationService = remoteCommunicationService;
        _indexingService = indexingService;
        _dbContext = dbContext;
        _versionControlService = versionControlService;
        _logger = logger;
    }

    public async Task RegisterProject(string cloneUrl, string branch, string name)
    {
        var systemName = name.ToLower().Replace(' ', '-');
        var directory = Path.Combine(_parlanceOptions.Value.RepositoryDirectory, systemName);
        var project = new Database.Models.Project
        {
            Name = name,
            SystemName = systemName,
            VcsDirectory = directory
        };

        void TryDeleteDirectory(Exception ex, string directoryPath)
        {
            try
            {
                _logger.LogError(ex, "Error registering repository. Deleting directory {Directory}", directoryPath);
                Directory.Delete(directoryPath, true);
            }
            catch
            {
                // ignored
            }
        }

        try
        {
            await _versionControlService.DownloadFromSource(cloneUrl, directory, branch);
        }
        catch (Exception ex)
        {
            TryDeleteDirectory(ex, directory);
            throw;
        }

        try
        {
            //Run checks on the project
            await _indexingService.IndexProject(project.GetParlanceProject());
        }
        catch (Exception ex)
        {
            TryDeleteDirectory(ex, directory);
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