namespace Parlance.Project;


public interface IParlanceProject
{
    public IEnumerable<IParlanceSubproject> Subprojects { get; }
    public IParlanceSubproject SubprojectBySystemName(string systemName);
}