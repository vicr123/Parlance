using System.Text.Json;
using Parlance.Database.Models;

namespace Parlance.Notifications.Channels.TranslationFreeze;

public class TranslationFreezeNotificationChannelSubscription : INotificationChannelSubscription
{
    record SubscriptionData(string Project);
    
    public TranslationFreezeNotificationChannelSubscription(NotificationSubscription subscription)
    {
        UserId = subscription.UserId;
        Enabled = subscription.Enabled;
        Channel = subscription.Channel;
        AutoSubscriptionSource = subscription.AutoSubscriptionSource;

        var data = JsonSerializer.Deserialize<SubscriptionData>(subscription.SubscriptionData)!;
        Project = data.Project;
    }

    public TranslationFreezeNotificationChannelSubscription(ulong userId, string channel, string project, NotificationEventAutoSubscription? eventSource = null)
    {
        UserId = userId;
        AutoSubscriptionSource = eventSource;
        Channel = channel;
        Project = project;
    }

    public ulong UserId { get; }
    
    public bool Enabled { get; }
    
    public NotificationEventAutoSubscription? AutoSubscriptionSource { get; }
    
    public string Channel { get; }
    
    public string Project { get; }
    
    public string GetSubscriptionData()
    {
        return JsonSerializer.Serialize(new SubscriptionData(Project));
    }
}
