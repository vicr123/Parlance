using MessagePipe;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Parlance.Database;
using Parlance.Database.Interfaces;
using Parlance.Database.Models;
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

    public async Task UpgradeProject(Database.Models.Project project)
    {
        // Reclone the project
        var oldVcsDirectory = project.VcsDirectory;
        var systemName = project.SystemName!;
        var directory = Path.Combine(parlanceOptions.Value.RepositoryDirectory, "bare", systemName);
        var cloneUrl = versionControlService.CloneUrl(project);
        var branch = versionControlService.BranchName(project);

        var branchSystemName = project.SystemName + "-" + branch.ToLower().Replace(' ', '-').Replace('/', '-');
        var worktreeDirectory = Path.Combine(parlanceOptions.Value.RepositoryDirectory, "branches", systemName, branchSystemName);
        var projectBranch = new Database.Models.ProjectBranch
        {
            SystemName = branchSystemName,
            BranchName = branch,
            VcsDirectory = worktreeDirectory,
            IsDefault = true,
            Parent = project
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
            await versionControlService.DownloadFromSourceBare(cloneUrl, directory);
            project.VcsDirectory = directory;

            await versionControlService.CreateWorktree(project, worktreeDirectory, branch);

            dbContext.ProjectBranches.Add(projectBranch);
            dbContext.Projects.Update(project);
            await dbContext.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            TryDeleteDirectory(ex, directory);
            TryDeleteDirectory(ex, worktreeDirectory);
            throw;
        }
        
        
        Directory.Delete(oldVcsDirectory!, true);
    }

    public async Task CloneBranch(Database.Models.Project project, string branch)
    {
        var systemName = project.SystemName!;

        var branchSystemName = project.SystemName + "-" + branch.ToLower().Replace(' ', '-').Replace('/', '-');
        var worktreeDirectory = Path.Combine(parlanceOptions.Value.RepositoryDirectory, "branches", systemName, branchSystemName);
        if (Directory.Exists(worktreeDirectory))
        {
            throw new DuplicateResourceException();
        }
        
        var projectBranch = new Database.Models.ProjectBranch
        {
            SystemName = branchSystemName,
            BranchName = branch,
            VcsDirectory = worktreeDirectory,
            IsDefault = false,
            Parent = project
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
            await versionControlService.CreateWorktree(project, worktreeDirectory, branch);

            dbContext.ProjectBranches.Add(projectBranch);
            await dbContext.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            TryDeleteDirectory(ex, worktreeDirectory);
            throw;
        }
    }

    public async Task DeleteBranch(ProjectBranch projectBranch)
    {
        if (projectBranch.IsDefault)
        {
            throw new InvalidOperationException();
        }
        
        dbContext.ProjectBranches.Remove(projectBranch);
        await versionControlService.DeleteWorktree(projectBranch, projectBranch.BranchName);
        await dbContext.SaveChangesAsync();
    }

    public async Task<IEnumerable<Database.Models.Project>> Projects()
    {
        var projects = await dbContext.Projects.ToListAsync();
        foreach (var project in projects)
        {
            await dbContext.Entry(project).Collection(p => p.Branches).LoadAsync();
        }
        return projects;
    }

    public async Task<IVcsable> ProjectBySystemName(string systemName)
    {
        try
        {
            var projectBranch = await dbContext.ProjectBranches.ToAsyncEnumerable().SingleOrDefaultAsync(x => x.SystemName == systemName);
            if (projectBranch is not null)
            {
                await dbContext.Entry(projectBranch).Reference(b => b.Parent).LoadAsync();
                return projectBranch;
            }
            
            var projects = await Projects();
            var project = projects.Single(project => project.SystemName == systemName);
            var branches = project.Branches;
            var defaultBranch = branches.FirstOrDefault(branch => branch.IsDefault) ?? branches.FirstOrDefault();
            if (defaultBranch is null)
            {
                return project;
            }
            
            return defaultBranch;
        }
        catch (InvalidOperationException)
        {
            throw new ProjectNotFoundException();
        }
    }

    public async Task RemoveProject(Database.Models.Project project)
    {
        await dbContext.Entry(project).Collection(p => p.Branches).LoadAsync();
        foreach (var branch in project.Branches)
        {
            Directory.Delete(branch.VcsDirectory, true);
            dbContext.ProjectBranches.Remove(branch);
        }
        
        dbContext.Projects.Remove(project);
        await dbContext.SaveChangesAsync();
        
        Directory.Delete(project.VcsDirectory, true);
    }
}