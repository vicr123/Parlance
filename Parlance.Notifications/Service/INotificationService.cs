using Parlance.CldrData;
using Parlance.Database.Models;
using Parlance.Notifications.Channels;

namespace Parlance.Notifications.Service;

public interface INotificationService
{
    Task SetUnsubscriptionState(ulong userId, bool unsubscribed);
    Task<bool> GetUnsubscriptionState(ulong userId);

    Task AddSubscriptionPreference<T>(INotificationChannelSubscription<T> subscription, bool enabled) where T : INotificationChannelSubscription<T>;
    Task UpsertSubscriptionPreference<T>(INotificationChannelSubscription<T> subscription, bool enabled) where T : INotificationChannelSubscription<T>;
    Task RemoveSubscriptionPreference<T>(INotificationChannelSubscription<T> subscription) where T : INotificationChannelSubscription<T>;

    IAsyncEnumerable<TSubscription> SavedSubscriptionPreferences<TNotificationChannel, TSubscription>()
        where TNotificationChannel : INotificationChannel where TSubscription : INotificationChannelSubscription<TSubscription>;

    Task<AutoSubscriptionPreference> GetAutoSubscriptionPreference<TAutoSubscription, TChannel>(ulong userId, bool defaultValue) where TAutoSubscription : IAutoSubscription<TChannel> where TChannel : INotificationChannel;
    Task SetAutoSubscriptionPreference<TAutoSubscription, TChannel>(ulong userId, bool isSubscribed) where TAutoSubscription : IAutoSubscription<TChannel> where TChannel : INotificationChannel;

    Task SendEmailNotification<TChannel>(ulong userId, Locale locale, object args) where TChannel : INotificationChannel;
}

public record AutoSubscriptionPreference(NotificationEventAutoSubscription Subscription, bool IsSubscribed);