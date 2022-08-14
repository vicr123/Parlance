using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Parlance.Vicr123Accounts.Authentication;
using Parlance.Vicr123Accounts.Services;

namespace Parlance.Vicr123Accounts;

public static class Vicr123AccountsExtensions
{
    public static IServiceCollection AddVicr123Accounts(this IServiceCollection services, IConfiguration configuration)
    {
        var useDummy = configuration.GetSection("Parlance")["UseDummyAuthenticationService"];
        if (useDummy is not null && useDummy == "True")
        {
            services.AddSingleton<IVicr123AccountsService, Vicr123AccountsDummyService>();
        }
        else
        {
            services.AddSingleton<IVicr123AccountsService, Vicr123AccountsService>();
        }
        services.AddSingleton<IAuthorizationHandler, Vicr123AuthorizationHandler>();

        return services;
    }
}