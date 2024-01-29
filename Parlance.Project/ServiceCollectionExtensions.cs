using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Parlance.Project.Checks;
using Parlance.Project.Index;
using Parlance.Project.SourceStrings;

namespace Parlance.Project;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddParlanceProjects(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddSingleton<IParlanceChecks, ParlanceChecks>();
        services.AddScoped<IParlanceIndexingService, ParlanceIndexingService>();
        services.AddScoped<IParlanceSourceStringsService, ParlanceSourceStringsService>();
        services.AddHostedService<ParlanceSourceStringsTranslationSubmitEventSubscriber>();
        return services;
    }
}