using System.Diagnostics;
using Parlance.Database.Interfaces;

namespace Parlance.Project;

public static class ParlanceProjectExtensions
{
    public static IParlanceProject GetParlanceProject(this Database.Models.Project project)
    {
        return ParlanceProject.CreateParlanceProject(project);
    }

    public static IParlanceProject GetParlanceProject(this Database.Models.ProjectBranch projectBranch)
    {
        return ParlanceProject.CreateParlanceProject(projectBranch);
    }
    
    public static IParlanceProject GetParlanceProject(this IVcsable vcsable)
    {
        if (vcsable is Database.Models.Project project)
        {
            return project.GetParlanceProject();
        }

        if (vcsable is Database.Models.ProjectBranch projectBranch)
        {
            return projectBranch.GetParlanceProject();
        }

        throw new UnreachableException(
            "Tried to get a Parlance project for an IVcsable that is not a project or project branch");
    }
}
