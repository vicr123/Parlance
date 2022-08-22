namespace Parlance.Project;

public class ParlanceSubproject : IParlanceSubproject
{
    private readonly SubprojectDefinition _subproject;

    public record SubprojectDefinition(string Name, string Type, string Path, string BaseLang);

    public ParlanceSubproject(IParlanceProject project, SubprojectDefinition subproject)
    {
        _subproject = subproject;
    }

    public string SystemName => _subproject.Name.ToLower().Replace(" ", "-");
}