using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Parlance.Notifications.Channels.TranslationFreeze;
using Parlance.Notifications.Service;

namespace Parlance.Notifications;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddNotifications(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddScoped<IEmailService, EmailService>();
        services.AddScoped<INotificationService, NotificationService>();
        services.AddScoped<IUnsubscribeService, UnsubscribeService>();
        services.AddHostedService<TranslationFreezeNotificationChannel>();
        services.AddHostedService<TranslationFreezeTranslationSubmitEventAutoSubscription>();
        services.Configure<EmailOptions>(configuration.GetSection("Email"));
        return services;
    }
}
