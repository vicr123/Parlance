namespace Parlance.Project;


public interface IParlanceProject
{
    public string VcsDirectory { get; }
    public IEnumerable<IParlanceSubproject> Subprojects { get; }
    public IParlanceSubproject SubprojectBySystemName(string systemName);
}