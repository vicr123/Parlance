using System.Reflection;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Parlance.Project.Checks;
using Parlance.Project.Index;
using Parlance.Project.TranslationFiles;

namespace Parlance.Project;

public static class ParlanceProjectExtensions
{
    public static IParlanceProject GetParlanceProject(this Database.Models.Project project)
    {
        return new ParlanceProject(project);
    }

    public static void InitializeParlanceProjects()
    {
        ParlanceSubprojectLanguage.TranslationFileTypes.AddRange(
            typeof(ParlanceProjectExtensions).Assembly.GetTypes().Where(t => t.IsDefined(typeof(TranslationFileTypeAttribute))));
    }

    public static IServiceCollection AddParlanceProjects(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddSingleton<IParlanceChecks, ParlanceChecks>();
        services.AddScoped<IParlanceIndexingService, ParlanceIndexingService>();
        return services;
    }
}