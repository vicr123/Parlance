using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Parlance.Vicr123Accounts.Authentication;
using Parlance.Vicr123Accounts.Services;

namespace Parlance.Vicr123Accounts;

public static class Vicr123AccountsExtensions
{
    public static IServiceCollection AddVicr123Accounts(this IServiceCollection services, IConfiguration configuration)
    {
        if (configuration.GetSection("Parlance").GetValue("UseDummyAuthenticationService", defaultValue: false))
            services.AddSingleton<IVicr123AccountsService, Vicr123AccountsDummyService>();
        else
            services.AddSingleton<IVicr123AccountsService, Vicr123AccountsService>();
        services.Configure<Vicr123AccountsOptions>(configuration.GetSection("Vicr123Accounts"));
        services.Configure<Fido2Options>(configuration.GetSection("fido2"));
        services.AddAuthentication(o => { o.DefaultScheme = Vicr123AuthenticationHandler.AuthenticationScheme; })
            .AddScheme<Vicr123AuthenticationOptions, Vicr123AuthenticationHandler>(
                Vicr123AuthenticationHandler.AuthenticationScheme, _ => { });

        services.AddFido2(options =>
        {
            options.ServerDomain = configuration.GetValue<string>("fido2:ServerDomain");
            options.Origins = configuration.GetSection("fido2:Origins").Get<HashSet<string>>();
            options.ServerName = "Parlance";
            options.TimestampDriftTolerance = 30000;
        }).AddCachedMetadataService(config => { config.AddFidoMetadataRepository(httpClientBuilder => { }); });

        return services;
    }
}