using Microsoft.Extensions.Options;
using Parlance.Database;
using Parlance.Project;
using Parlance.Project.Index;
using Parlance.VersionControl.Services;
using Parlance.VersionControl.Services.VersionControl;

namespace Parlance.Services.Projects;

public class ProjectService(
    IOptions<ParlanceOptions> parlanceOptions,
    IRemoteCommunicationService remoteCommunicationService,
    IParlanceIndexingService indexingService,
    ParlanceContext dbContext,
    IVersionControlService versionControlService,
    ILogger<ProjectService> logger)
    : IProjectService
{
    private readonly IRemoteCommunicationService _remoteCommunicationService = remoteCommunicationService;

    public async Task RegisterProject(string cloneUrl, string branch, string name)
    {
        var systemName = name.ToLower().Replace(' ', '-');
        var directory = Path.Combine(parlanceOptions.Value.RepositoryDirectory, systemName);
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
                logger.LogError(ex, "Error registering repository. Deleting directory {Directory}", directoryPath);
                Directory.Delete(directoryPath, true);
            }
            catch
            {
                // ignored
            }
        }

        try
        {
            await versionControlService.DownloadFromSource(cloneUrl, directory, branch);
        }
        catch (Exception ex)
        {
            TryDeleteDirectory(ex, directory);
            throw;
        }

        try
        {
            //Run checks on the project
            await indexingService.IndexProject(project.GetParlanceProject());
        }
        catch (Exception ex)
        {
            TryDeleteDirectory(ex, directory);
            throw;
        }

        dbContext.Projects.Add(project);

        await dbContext.SaveChangesAsync();
    }

    public Task<IEnumerable<Database.Models.Project>> Projects()
    {
        return Task.FromResult<IEnumerable<Database.Models.Project>>(dbContext.Projects);
    }

    public Task<Database.Models.Project> ProjectBySystemName(string systemName)
    {
        try
        {
            return Task.FromResult(dbContext.Projects.Single(project => project.SystemName == systemName));
        }
        catch (InvalidOperationException)
        {
            throw new ProjectNotFoundException();
        }
    }

    public async Task RemoveProject(Database.Models.Project project)
    {
        Directory.Delete(project.VcsDirectory, true);
        dbContext.Projects.Remove(project);

        await dbContext.SaveChangesAsync();
    }
}