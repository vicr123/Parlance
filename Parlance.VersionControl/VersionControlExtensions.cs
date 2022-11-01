using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Parlance.VersionControl.Services.PendingEdits;
using Parlance.VersionControl.Services.SshKeyManagement;
using Parlance.VersionControl.Services.VersionControl;

namespace Parlance.VersionControl;

public static class VersionControlExtensions
{
    public static IServiceCollection AddVersionControl(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddScoped<ISshKeyManagementService, SshKeyManagementService>();
        services.AddScoped<IVersionControlService, GitVersionControlService>();
        services.AddScoped<IPendingEditsService, PendingEditsService>();
        return services;
    }
}