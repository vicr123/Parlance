using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Parlance.Notifications.Channels.TranslationFreeze;
using Parlance.Notifications.Service;

namespace Parlance.Notifications;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddNotifications(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddScoped<INotificationService, NotificationService>();
        services.AddHostedService<TranslationFreezeNotificationChannel>();
        services.AddHostedService<TranslationFreezeTranslationSubmitEventAutoSubscription>();
        return services;
    }
}
