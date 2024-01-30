using Parlance.Database.Models;
using Parlance.Notifications.Channels;

namespace Parlance.Notifications.Service;

public interface INotificationService
{
    Task SetUnsubscriptionState(ulong userId, bool unsubscribed);
    Task<bool> GetUnsubscriptionState(ulong userId);

    Task AddSubscriptionPreference(INotificationChannelSubscription subscription, bool enabled);
    Task UpsertSubscriptionPreference(INotificationChannelSubscription subscription, bool enabled);
    Task RemoveSubscriptionPreference(INotificationChannelSubscription subscription);

    Task<AutoSubscriptionPreference> GetAutoSubscriptionPreference<TAutoSubscription, TChannel>(ulong userId, bool defaultValue) where TAutoSubscription : IAutoSubscription<TChannel> where TChannel : INotificationChannel;
    Task SetAutoSubscriptionPreference<TAutoSubscription, TChannel>(ulong userId, bool isSubscribed) where TAutoSubscription : IAutoSubscription<TChannel> where TChannel : INotificationChannel;
}

public record AutoSubscriptionPreference(NotificationEventAutoSubscription Subscription, bool IsSubscribed);