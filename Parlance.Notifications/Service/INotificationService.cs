using Parlance.Database.Models;
using Parlance.Notifications.Channels;

namespace Parlance.Notifications.Service;

public interface INotificationService
{
    Task AddSubscriptionPreference(INotificationChannelSubscriptionBase subscription, bool enabled);
    Task UpsertSubscriptionPreference(INotificationChannelSubscriptionBase subscription, bool enabled);
    Task RemoveSubscriptionPreference(INotificationChannelSubscriptionBase subscription);

    IAsyncEnumerable<TSubscription> SavedSubscriptionPreferences<TNotificationChannel, TSubscription>()
        where TNotificationChannel : INotificationChannel where TSubscription : INotificationChannelSubscription<TSubscription>;

    Task<AutoSubscriptionPreference> GetAutoSubscriptionPreference(string channel, string @event, ulong userId, bool defaultValue);
    Task<AutoSubscriptionPreference> GetAutoSubscriptionPreference<TAutoSubscription, TChannel>(ulong userId, bool defaultValue) where TAutoSubscription : IAutoSubscription<TChannel> where TChannel : INotificationChannel;
    Task SetAutoSubscriptionPreference<TAutoSubscription, TChannel>(ulong userId, bool isSubscribed) where TAutoSubscription : IAutoSubscription<TChannel> where TChannel : INotificationChannel;
    INotificationChannelSubscriptionBase DecodeDatabaseSubscription(NotificationSubscription subscription);
    Task SetAutoSubscriptionPreference(NotificationEventAutoSubscription subscriptionAutoSubscriptionSource,
        ulong userId, bool isSubscribed);

    Task<AutoSubscriptionPreference> GetAutoSubscriptionPreference(Type autoSubscriptionType, Type channelType, ulong userId, bool defaultValue);
}

public record AutoSubscriptionPreference(NotificationEventAutoSubscription Subscription, bool IsSubscribed);