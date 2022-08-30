namespace Parlance.Project.Index;

public interface IParlanceIndexingService
{
    public record OverallIndexResults(int Count, int Complete, int Warnings, int Errors, int CumulativeWarnings, int PassedChecks);
    
    public Task IndexProject(IParlanceProject project);
    public Task IndexSubproject(IParlanceSubproject subproject);
    public Task IndexTranslationFile(IParlanceSubprojectLanguage file);
    public Task<OverallIndexResults> OverallResults(IParlanceProject project);
    public Task<OverallIndexResults> OverallResults(IParlanceSubproject subproject);
    public Task<OverallIndexResults> OverallResults(IParlanceSubprojectLanguage file);
}