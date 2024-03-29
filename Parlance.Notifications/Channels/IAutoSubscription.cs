namespace Parlance.Notifications.Channels;

public interface IAutoSubscription
{
    public static abstract string AutoSubscriptionEventName { get; }
    
    public static abstract bool SubscribedByDefault { get; }
}
