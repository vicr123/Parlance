using Parlance.Database;
using Parlance.Database.Models;
using Parlance.Project.Checks;

namespace Parlance.Project.Index;

public class ParlanceIndexingService : IParlanceIndexingService
{
    private readonly ParlanceContext _dbContext;
    private readonly IParlanceChecks _checks;
    
    public enum IndexType
    {
        
    }

    public ParlanceIndexingService(ParlanceContext dbContext, IParlanceChecks checks)
    {
        _dbContext = dbContext;
        _checks = checks;
    }

    public async Task IndexProject(IParlanceProject project)
    {
        foreach (var subproject in project.Subprojects)
        {
            await IndexSubproject(subproject);
        }
    }

    public async Task IndexSubproject(IParlanceSubproject subproject)
    {
        foreach (var language in subproject.AvailableLanguages())
        {
            await IndexTranslationFile(subproject.Language(language));
        }
    }

    public async Task IndexTranslationFile(IParlanceSubprojectLanguage file)
    {
        _dbContext.Index.RemoveRange(_dbContext.Index.Where(item => item.Project == file.Subproject.Project.Name && item.Subproject == file.Subproject.Name && item.Language == file.Locale.ToDashed()));
        
        await using var translationFile = await file.CreateTranslationFile(null);
        if (translationFile is not null)
        {
            //Index the file
            foreach (var entry in translationFile.Entries)
            {
                //Check if the translation is complete
                if (entry.Translation.All(translation => translation.TranslationContent != ""))
                {
                    _dbContext.Index.Add(new IndexItem
                    {
                        Project = file.Subproject.Project.Name,
                        Subproject = file.Subproject.Name,
                        Language = file.Locale.ToDashed(),
                        ItemIdentifier = entry.Key,
                        RecordType = IndexItemType.Complete
                    });

                    var checks = entry.Translation.SelectMany(translation => _checks.CheckTranslation(entry.Source,
                        translation.TranslationContent, file.Subproject.TranslationFileType)).Select(x => x.CheckSeverity).ToList();
                    
                    if (checks.Contains(CheckResult.Severity.Error))
                    {
                        _dbContext.Index.Add(new IndexItem
                        {
                            Project = file.Subproject.Project.Name,
                            Subproject = file.Subproject.Name,
                            Language = file.Locale.ToDashed(),
                            ItemIdentifier = entry.Key,
                            RecordType = IndexItemType.Error
                        });
                    }
                    else if (checks.Contains(CheckResult.Severity.Warning))
                    {
                        _dbContext.Index.Add(new IndexItem
                        {
                            Project = file.Subproject.Project.Name,
                            Subproject = file.Subproject.Name,
                            Language = file.Locale.ToDashed(),
                            ItemIdentifier = entry.Key,
                            RecordType = IndexItemType.CumulativeWarning
                        });
                    }
                    else
                    {
                        _dbContext.Index.Add(new IndexItem
                        {
                            Project = file.Subproject.Project.Name,
                            Subproject = file.Subproject.Name,
                            Language = file.Locale.ToDashed(),
                            ItemIdentifier = entry.Key,
                            RecordType = IndexItemType.PassedChecks
                        });
                    }

                    if (checks.Contains(CheckResult.Severity.Warning))
                    {
                        _dbContext.Index.Add(new IndexItem
                        {
                            Project = file.Subproject.Project.Name,
                            Subproject = file.Subproject.Name,
                            Language = file.Locale.ToDashed(),
                            ItemIdentifier = entry.Key,
                            RecordType = IndexItemType.Warning
                        });
                    }
                }
                
                
                _dbContext.Index.Add(new IndexItem
                {
                    Project = file.Subproject.Project.Name,
                    Subproject = file.Subproject.Name,
                    Language = file.Locale.ToDashed(),
                    ItemIdentifier = entry.Key,
                    RecordType = IndexItemType.TranslationString
                });
            }
        }

        await _dbContext.SaveChangesAsync();
    }

    public Task<IParlanceIndexingService.OverallIndexResults> OverallResults(IParlanceProject project)
    {
        return Task.FromResult(new IParlanceIndexingService.OverallIndexResults(
            _dbContext.Index.Count(item => item.Project == project.Name && item.RecordType == IndexItemType.TranslationString),
            _dbContext.Index.Count(item => item.Project == project.Name && item.RecordType == IndexItemType.Complete),
            _dbContext.Index.Count(item => item.Project == project.Name && item.RecordType == IndexItemType.Warning),
            _dbContext.Index.Count(item => item.Project == project.Name && item.RecordType == IndexItemType.Error),
            _dbContext.Index.Count(item => item.Project == project.Name && item.RecordType == IndexItemType.CumulativeWarning),
            _dbContext.Index.Count(item => item.Project == project.Name && item.RecordType == IndexItemType.PassedChecks)
        ));
    }

    public Task<IParlanceIndexingService.OverallIndexResults> OverallResults(IParlanceSubproject subproject)
    {
        return Task.FromResult(new IParlanceIndexingService.OverallIndexResults(
            _dbContext.Index.Count(item => item.Project == subproject.Project.Name && item.Subproject == subproject.Name && item.RecordType == IndexItemType.TranslationString),
            _dbContext.Index.Count(item => item.Project == subproject.Project.Name && item.Subproject == subproject.Name && item.RecordType == IndexItemType.Complete),
            _dbContext.Index.Count(item => item.Project == subproject.Project.Name && item.Subproject == subproject.Name && item.RecordType == IndexItemType.Warning),
            _dbContext.Index.Count(item => item.Project == subproject.Project.Name && item.Subproject == subproject.Name && item.RecordType == IndexItemType.Error),
            _dbContext.Index.Count(item => item.Project == subproject.Project.Name && item.Subproject == subproject.Name && item.RecordType == IndexItemType.CumulativeWarning),
            _dbContext.Index.Count(item => item.Project == subproject.Project.Name && item.Subproject == subproject.Name && item.RecordType == IndexItemType.PassedChecks)
        ));
    }

    public Task<IParlanceIndexingService.OverallIndexResults> OverallResults(IParlanceSubprojectLanguage file)
    {
        return Task.FromResult(new IParlanceIndexingService.OverallIndexResults(
            _dbContext.Index.Count(item => item.Project == file.Subproject.Project.Name && item.Subproject == file.Subproject.Name && item.Language == file.Locale.ToDashed() && item.RecordType == IndexItemType.TranslationString),
            _dbContext.Index.Count(item => item.Project == file.Subproject.Project.Name && item.Subproject == file.Subproject.Name && item.Language == file.Locale.ToDashed() && item.RecordType == IndexItemType.Complete),
            _dbContext.Index.Count(item => item.Project == file.Subproject.Project.Name && item.Subproject == file.Subproject.Name && item.Language == file.Locale.ToDashed() && item.RecordType == IndexItemType.Warning),
            _dbContext.Index.Count(item => item.Project == file.Subproject.Project.Name && item.Subproject == file.Subproject.Name && item.Language == file.Locale.ToDashed() && item.RecordType == IndexItemType.Error),
            _dbContext.Index.Count(item => item.Project == file.Subproject.Project.Name && item.Subproject == file.Subproject.Name && item.Language == file.Locale.ToDashed() && item.RecordType == IndexItemType.CumulativeWarning),
            _dbContext.Index.Count(item => item.Project == file.Subproject.Project.Name && item.Subproject == file.Subproject.Name && item.Language == file.Locale.ToDashed() && item.RecordType == IndexItemType.PassedChecks)
        ));
    }
}