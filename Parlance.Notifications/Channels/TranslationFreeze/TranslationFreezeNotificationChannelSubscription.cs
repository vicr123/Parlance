using System.Text.Json;
using Parlance.Database.Models;
using Parlance.Notifications.Generated;

namespace Parlance.Notifications.Channels.TranslationFreeze;

[ChannelSubscription(typeof(TranslationFreezeNotificationChannel))]
public class TranslationFreezeNotificationChannelSubscription : INotificationChannelSubscription<TranslationFreezeNotificationChannelSubscription>
{
    record SubscriptionData(string Project);

    private TranslationFreezeNotificationChannelSubscription(string channel, string project)
    {
        Channel = channel;
        Project = project;
    }

    public TranslationFreezeNotificationChannelSubscription(ulong userId, string channel, string project, NotificationEventAutoSubscription? eventSource = null)
    {
        UserId = userId;
        AutoSubscriptionSource = eventSource;
        Channel = channel;
        Project = project;
    }

    public static TranslationFreezeNotificationChannelSubscription FromDatabase(NotificationSubscription subscription)
    {
        var data = JsonSerializer.Deserialize<SubscriptionData>(subscription.SubscriptionData)!;
        return new TranslationFreezeNotificationChannelSubscription(subscription.Channel, data.Project)
        {
            Id = subscription.Id,
            UserId = subscription.UserId,
            Enabled = subscription.Enabled,
            AutoSubscriptionSource = subscription.AutoSubscriptionSource
        };
    }

    public Guid Id { get; private init; }
    public ulong UserId { get; private init; }

    public bool Enabled { get; private init; }

    public NotificationEventAutoSubscription? AutoSubscriptionSource { get; private init; }

    public string Channel { get; }
    
    public string Project { get; }
    
    public string GetSubscriptionData()
    {
        return JsonSerializer.Serialize(new SubscriptionData(Project));
    }
}
