namespace Parlance.Project;

public static class ParlanceProjectExtensions
{
    public static IParlanceProject GetParlanceProject(this Database.Models.Project project)
    {
        return new ParlanceProject(project);
    }
}
