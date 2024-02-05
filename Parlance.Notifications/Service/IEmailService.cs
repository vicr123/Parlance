using Parlance.CldrData;
using Parlance.Notifications.Channels;

namespace Parlance.Notifications.Service;

public interface IEmailService
{
    Task SendEmailNotification<TChannel>(INotificationChannelSubscriptionBase subscription,
        Locale locale, object args) where TChannel : INotificationChannel;
}