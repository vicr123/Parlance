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

    IEnumerable<AutoSubscription> GetAutoSubscriptions();
    Task<AutoSubscriptionPreference> GetAutoSubscriptionPreference(string channel, string @event, ulong userId);
    Task<AutoSubscriptionPreference> GetAutoSubscriptionPreference<TAutoSubscription, TChannel>(ulong userId) where TAutoSubscription : IAutoSubscription where TChannel : INotificationChannel;
    Task SetAutoSubscriptionPreference<TAutoSubscription, TChannel>(ulong userId, bool isSubscribed) where TAutoSubscription : IAutoSubscription where TChannel : INotificationChannel;
    INotificationChannelSubscriptionBase DecodeDatabaseSubscription(NotificationSubscription subscription);
    Task SetAutoSubscriptionPreference(NotificationEventAutoSubscription subscriptionAutoSubscriptionSource, ulong userId, bool isSubscribed);
    Task SetAutoSubscriptionPreference(string channel, string @event, ulong userId, bool isSubscribed);

    Task<AutoSubscriptionPreference> GetAutoSubscriptionPreference(Type autoSubscriptionType, Type channelType,
        ulong userId);
}

public record AutoSubscriptionPreference(NotificationEventAutoSubscription Subscription, bool IsSubscribed);

public record AutoSubscription(string Channel, string Event, bool SubscribedByDefault);
