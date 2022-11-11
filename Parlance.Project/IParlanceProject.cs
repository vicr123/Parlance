namespace Parlance.Project;

public interface IParlanceProject
{
    public string Name { get; }
    public string ReadableName { get; }
    public string VcsDirectory { get; }
    public DateTime? Deadline { get; }
    public IReadOnlyList<IParlanceSubproject> Subprojects { get; }
    public IParlanceSubproject SubprojectBySystemName(string systemName);
}