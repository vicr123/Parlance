using Parlance.Database.Models;

namespace Parlance.Notifications.Channels;

public interface INotificationChannelSubscription
{
    ulong UserId { get; }
    
    bool Enabled { get; }
    
    NotificationEventAutoSubscription? AutoSubscriptionSource { get; }
    
    string Channel { get; }

    string GetSubscriptionData();
}