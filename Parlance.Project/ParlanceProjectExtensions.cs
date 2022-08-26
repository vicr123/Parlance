using System.Reflection;
using Parlance.Project.TranslationFiles;

namespace Parlance.Project;

public static class ParlanceProjectExtensions
{
    public static IParlanceProject GetParlanceProject(this Database.Models.Project project)
    {
        return new ParlanceProject(project);
    }

    public static void InitialiseParlanceProjects()
    {
        ParlanceSubprojectLanguage.TranslationFileTypes.AddRange(Assembly.GetExecutingAssembly().GetTypes().Where(t => t.IsDefined(typeof(TranslationFileTypeAttribute))));
    }
}