using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Parlance.Glossary.Services;

namespace Parlance.Glossary;

public static class GlossaryExtensions
{
    public static IServiceCollection AddGlossary(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddScoped<IGlossaryService, GlossaryService>();
        return services;
    }

}