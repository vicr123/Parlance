namespace Parlance.Notifications.Channels;

public interface IAutoSubscription<TChannel> where TChannel : INotificationChannel
{
    public static abstract string AutoSubscriptionEventName { get; }
}
