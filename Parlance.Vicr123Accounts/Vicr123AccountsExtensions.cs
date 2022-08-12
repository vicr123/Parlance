using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.DependencyInjection;
using Parlance.Vicr123Accounts.Authentication;
using Parlance.Vicr123Accounts.Services;

namespace Parlance.Vicr123Accounts;

public static class Vicr123AccountsExtensions
{
    public static IServiceCollection AddVicr123Accounts(this IServiceCollection services)
    {
        services.AddSingleton<IVicr123AccountsService, Vicr123AccountsService>();
        services.AddSingleton<IAuthorizationHandler, Vicr123AuthorizationHandler>();

        return services;
    }
}