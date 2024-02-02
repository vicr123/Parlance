using Microsoft.EntityFrameworkCore;
using Parlance.Database;
using Parlance.Database.Models;
using Parlance.Notifications.Channels;
using Parlance.Notifications.Channels.TranslationFreeze;

namespace Parlance.Notifications.Service;

public class NotificationService(ParlanceContext dbContext) : INotificationService
{
    public async Task AddSubscriptionPreference(INotificationChannelSubscriptionBase subscription, bool enabled)
    {
        dbContext.NotificationSubscriptions.Add(new NotificationSubscription()
        {
            UserId = subscription.UserId,
            Enabled = enabled,
            AutoSubscriptionSource = subscription.AutoSubscriptionSource,
            Channel = subscription.Channel,
            SubscriptionData = subscription.GetSubscriptionData()
        });
        await dbContext.SaveChangesAsync();
    }

    public async Task UpsertSubscriptionPreference(INotificationChannelSubscriptionBase subscription, bool enabled)
    {
        var subscriptionObject = await dbContext.NotificationSubscriptions.SingleOrDefaultAsync(x =>
            x.Channel == subscription.Channel && x.SubscriptionData == subscription.GetSubscriptionData() &&
            x.UserId == subscription.UserId);

        if (subscriptionObject is null)
        {
            await AddSubscriptionPreference(subscription, enabled);
            return;
        }
        
        subscriptionObject.Enabled = enabled;
        dbContext.NotificationSubscriptions.Update(subscriptionObject);
        await dbContext.SaveChangesAsync();
    }

    public async Task RemoveSubscriptionPreference(INotificationChannelSubscriptionBase subscription)
    {
        var dbSubscription = await dbContext.NotificationSubscriptions.Where(x =>
            x.UserId == subscription.UserId && x.SubscriptionData == subscription.GetSubscriptionData() &&
            x.Channel == subscription.Channel).ToListAsync();

        if (dbSubscription.Count != 0)
        {
            dbContext.NotificationSubscriptions.RemoveRange(dbSubscription);
            await dbContext.SaveChangesAsync();
        }
    }

    public IAsyncEnumerable<TSubscription> SavedSubscriptionPreferences<TNotificationChannel, TSubscription>() where TNotificationChannel : INotificationChannel where TSubscription : INotificationChannelSubscription<TSubscription>
    {
        var channelName = TNotificationChannel.ChannelName;
        return dbContext.NotificationSubscriptions
            .Where(x => x.Channel == channelName)
            .AsAsyncEnumerable()
            .Select(TSubscription.FromDatabase);
    }

    public INotificationChannelSubscriptionBase DecodeDatabaseSubscription(NotificationSubscription subscription)
    {
        //TODO: Use reflection?

        if (subscription.Channel == TranslationFreezeNotificationChannel.ChannelName)
        {
            return TranslationFreezeNotificationChannelSubscription.FromDatabase(subscription);
        }

        throw new ArgumentOutOfRangeException(nameof(subscription));
    }

    public async Task SetAutoSubscriptionPreference(NotificationEventAutoSubscription subscriptionAutoSubscriptionSource, ulong userId,
        bool isSubscribed)
    {
        var (subscription, isSubscriptionSubscribed) = await GetAutoSubscriptionPreference(subscriptionAutoSubscriptionSource, userId, isSubscribed);
        if (isSubscriptionSubscribed != isSubscribed)
        {
            subscription.Enabled = isSubscribed;
            dbContext.Update(subscription);
            await dbContext.SaveChangesAsync();
        }
    }
    
    public async Task<AutoSubscriptionPreference> GetAutoSubscriptionPreference(NotificationEventAutoSubscription subscriptionAutoSubscriptionSource, ulong userId, bool defaultValue)
    {
        var autoSubscriptionEventName = subscriptionAutoSubscriptionSource.Event;
        var channelName = subscriptionAutoSubscriptionSource.Channel;
        var entry = await dbContext.NotificationEventAutoSubscriptions.FirstOrDefaultAsync(
            x => x.Event == autoSubscriptionEventName && x.UserId == userId && x.Channel == channelName);

        if (entry is null)
        {
            // Insert a new entry
            entry = new NotificationEventAutoSubscription
            {
                Enabled = defaultValue,
                Channel = channelName,
                Event = autoSubscriptionEventName,
                UserId = userId
            };
            dbContext.NotificationEventAutoSubscriptions.Add(entry);
            await dbContext.SaveChangesAsync();
        }

        return new AutoSubscriptionPreference(entry, entry.Enabled);
    }

    public async Task<AutoSubscriptionPreference> GetAutoSubscriptionPreference<TAutoSubscription, TChannel>(ulong userId, bool defaultValue) where TAutoSubscription : IAutoSubscription<TChannel> where TChannel : INotificationChannel
    {
        return await GetAutoSubscriptionPreference(new()
        {
            Channel = TChannel.ChannelName,
            Event = TAutoSubscription.AutoSubscriptionEventName
        }, userId, defaultValue);
    }

    public async Task SetAutoSubscriptionPreference<TAutoSubscription, TChannel>(ulong userId, bool isSubscribed) where TAutoSubscription : IAutoSubscription<TChannel> where TChannel : INotificationChannel
    {
        await SetAutoSubscriptionPreference(new()
        {
            Channel = TChannel.ChannelName,
            Event = TAutoSubscription.AutoSubscriptionEventName
        }, userId, isSubscribed);
    }
}
