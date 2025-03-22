using MessagePipe;
using Microsoft.Extensions.Options;
using Parlance.Database;
using Parlance.Project;
using Parlance.Project.Events;
using Parlance.Project.Index;
using Parlance.VersionControl.Services;
using Parlance.VersionControl.Services.VersionControl;

namespace Parlance.Services.Projects;

public class ProjectService(
    IOptions<ParlanceOptions> parlanceOptions,
    IParlanceIndexingService indexingService,
    ParlanceContext dbContext,
    IVersionControlService versionControlService,
    IAsyncPublisher<TranslationSubmitEvent> translationSubmitEventPublisher,
    ILogger<ProjectService> logger)
    : IProjectService
{
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
        
        // Add existing translations to the database
        foreach (var subproject in project.GetParlanceProject().Subprojects)
        {
            foreach (var language in subproject.AvailableLanguages())
            {
                var subprojectLanguage = subproject.Language(language);
                await using var translationFile = await subprojectLanguage.CreateTranslationFile(indexingService);
                if (translationFile is null) continue;
                
                foreach (var entry in translationFile.Entries)
                {
                    await translationSubmitEventPublisher.PublishAsync(new()
                    {
                        Project = project,
                        SubprojectLanguage = subprojectLanguage,
                        Entry = entry,
                        User = null,
                    });
                }
            }
        }
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
        dbContext.Projects.Remove(project);
        await dbContext.SaveChangesAsync();
        
        Directory.Delete(project.VcsDirectory, true);
    }
}