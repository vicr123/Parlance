using Parlance.Database.Models;

namespace Parlance.Notifications.Channels;

public interface INotificationChannelSubscription<out T> : INotificationChannelSubscriptionBase where T : INotificationChannelSubscription<T>
{
    public static abstract T FromDatabase(NotificationSubscription subscription);
}

public interface INotificationChannelSubscriptionBase
{
    Guid Id { get; }
    
    ulong UserId { get; }
    
    bool Enabled { get; }
    
    NotificationEventAutoSubscription? AutoSubscriptionSource { get; }
    
    string Channel { get; }

    string GetSubscriptionData();
}

