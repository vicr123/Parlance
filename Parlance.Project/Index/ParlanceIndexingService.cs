using Parlance.CldrData;
using Parlance.Database;
using Parlance.Database.Models;
using Parlance.Project.Checks;

namespace Parlance.Project.Index;

public class ParlanceIndexingService(ParlanceContext dbContext, IParlanceChecks checks) : IParlanceIndexingService
{
    public enum IndexType
    {
    }

    public async Task IndexProject(IParlanceProject project)
    {
        foreach (var subproject in project.Subprojects) await IndexSubproject(subproject);
    }

    public async Task IndexSubproject(IParlanceSubproject subproject)
    {
        foreach (var language in subproject.AvailableLanguages())
            await IndexTranslationFile(subproject.Language(language));
    }

    public async Task IndexTranslationFile(IParlanceSubprojectLanguage file)
    {
        try
        {
            dbContext.Index.RemoveRange(dbContext.Index.Where(item =>
                item.Project == file.Subproject.Project.Name && item.Subproject == file.Subproject.Name &&
                item.Language == file.Locale.ToDatabaseRepresentation()));

            await using var translationFile = await file.CreateTranslationFile(null);
            if (translationFile is not null)
                //Index the file
                foreach (var entry in translationFile.Entries)
                {
                    //Check if the translation is complete
                    if (entry.Translation.All(translation => translation.TranslationContent != ""))
                    {
                        dbContext.Index.Add(new IndexItem
                        {
                            Project = file.Subproject.Project.Name,
                            Subproject = file.Subproject.Name,
                            Language = file.Locale.ToDatabaseRepresentation(),
                            ItemIdentifier = entry.Key,
                            RecordType = IndexItemType.Complete
                        });

                        var checks1 = entry.Translation.SelectMany(translation => checks.CheckTranslation(entry.Source,
                                translation.TranslationContent, file.Subproject.TranslationFileType))
                            .Select(x => x.CheckSeverity).ToList();

                        if (checks1.Contains(CheckResult.Severity.Error))
                            dbContext.Index.Add(new IndexItem
                            {
                                Project = file.Subproject.Project.Name,
                                Subproject = file.Subproject.Name,
                                Language = file.Locale.ToDatabaseRepresentation(),
                                ItemIdentifier = entry.Key,
                                RecordType = IndexItemType.Error
                            });
                        else if (checks1.Contains(CheckResult.Severity.Warning))
                            dbContext.Index.Add(new IndexItem
                            {
                                Project = file.Subproject.Project.Name,
                                Subproject = file.Subproject.Name,
                                Language = file.Locale.ToDatabaseRepresentation(),
                                ItemIdentifier = entry.Key,
                                RecordType = IndexItemType.CumulativeWarning
                            });
                        else
                            dbContext.Index.Add(new IndexItem
                            {
                                Project = file.Subproject.Project.Name,
                                Subproject = file.Subproject.Name,
                                Language = file.Locale.ToDatabaseRepresentation(),
                                ItemIdentifier = entry.Key,
                                RecordType = IndexItemType.PassedChecks
                            });

                        if (checks1.Contains(CheckResult.Severity.Warning))
                            dbContext.Index.Add(new IndexItem
                            {
                                Project = file.Subproject.Project.Name,
                                Subproject = file.Subproject.Name,
                                Language = file.Locale.ToDatabaseRepresentation(),
                                ItemIdentifier = entry.Key,
                                RecordType = IndexItemType.Warning
                            });
                    }

                    var originalSource = dbContext.SourceStrings.SingleOrDefault(x =>
                        x.Key == entry.Key && x.Language == file.Locale.ToDatabaseRepresentation() &&
                        x.Project == file.Subproject.Project.Name && x.Subproject == file.Subproject.SystemName);

                    if (originalSource != default)
                        if (originalSource.SourceTranslation !=
                            entry.Source)
                            dbContext.Index.Add(new IndexItem
                            {
                                Project = file.Subproject.Project.Name,
                                Subproject = file.Subproject.Name,
                                Language = file.Locale.ToDatabaseRepresentation(),
                                ItemIdentifier = entry.Key,
                                RecordType = IndexItemType.OutOfDate
                            });

                    dbContext.Index.Add(new IndexItem
                    {
                        Project = file.Subproject.Project.Name,
                        Subproject = file.Subproject.Name,
                        Language = file.Locale.ToDatabaseRepresentation(),
                        ItemIdentifier = entry.Key,
                        RecordType = IndexItemType.TranslationString
                    });
                }

            await dbContext.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            Console.WriteLine(ex);
            // ignored
        }
    }
    
    private static Task<IParlanceIndexingService.OverallIndexResults> IndexData(Dictionary<IndexItemType, int> types)
    {
        return Task.FromResult(new IParlanceIndexingService.OverallIndexResults(types.GetValueOrDefault(IndexItemType.TranslationString),
            types.GetValueOrDefault(IndexItemType.Complete), types.GetValueOrDefault(IndexItemType.Warning),
            types.GetValueOrDefault(IndexItemType.Error), types.GetValueOrDefault(IndexItemType.CumulativeWarning),
            types.GetValueOrDefault(IndexItemType.PassedChecks), types.GetValueOrDefault(IndexItemType.OutOfDate)));
    }

    public async Task<IParlanceIndexingService.OverallIndexResults> OverallResults(IParlanceProject project)
    {
        var types = dbContext.Index.Where(item => item.Project == project.Name)
            .GroupBy(item => item.RecordType, (key, results) => new { Key = key, Count = results.Count() })
            .ToDictionary(x => x.Key, x => x.Count);

        return await IndexData(types);
    }
    
    public async Task<IParlanceIndexingService.OverallIndexResults> OverallResults(IParlanceSubproject subproject)
    {
        var types = dbContext.Index
            .Where(item => item.Project == subproject.Project.Name && item.Subproject == subproject.Name)
            .GroupBy(item => item.RecordType, (key, results) => new { Key = key, Count = results.Count() })
            .ToDictionary(x => x.Key, x => x.Count);

        return await IndexData(types);
    }

    public async Task<IParlanceIndexingService.OverallIndexResults> OverallResults(IParlanceSubprojectLanguage file)
    {
        var types = dbContext.Index.Where(item =>
                item.Project == file.Subproject.Project.Name && item.Subproject == file.Subproject.Name &&
                item.Language == file.Locale.ToDatabaseRepresentation())
            .GroupBy(item => item.RecordType, (key, results) => new { Key = key, Count = results.Count() })
            .ToDictionary(x => x.Key, x => x.Count);

        return await IndexData(types);
    }

    public async Task<IParlanceIndexingService.OverallIndexResults> OverallResults(Locale locale)
    {
        var types = dbContext.Index.Where(item => item.Language == locale.ToDatabaseRepresentation())
            .GroupBy(item => item.RecordType, (key, results) => new { Key = key, Count = results.Count() })
            .ToDictionary(x => x.Key, x => x.Count);

        return await IndexData(types);
    }
}