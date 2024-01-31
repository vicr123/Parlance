using Parlance.Database.Models;

namespace Parlance.Notifications.Channels;

public interface INotificationChannelSubscription<out T> where T : INotificationChannelSubscription<T>
{
    public static abstract T FromDatabase(NotificationSubscription subscription);
    
    ulong UserId { get; }
    
    bool Enabled { get; }
    
    NotificationEventAutoSubscription? AutoSubscriptionSource { get; }
    
    string Channel { get; }

    string GetSubscriptionData();
}

