using Microsoft.EntityFrameworkCore;
using Parlance.Database;
using Parlance.Database.Models;
using Parlance.Notifications.Channels;

namespace Parlance.Notifications.Service;

public class NotificationService(ParlanceContext dbContext) : INotificationService
{
    public async Task SetUnsubscriptionState(ulong userId, bool unsubscribed)
    {
        // Check if user unsubscription exists
        var unsubscription = await dbContext.NotificationUnsubscriptions.FirstOrDefaultAsync(nu => nu.UserId == userId);

        // If unsubscription exists and we want to subscribe the user, remove the unsubscription
        if (unsubscription != null && !unsubscribed)
        {
            dbContext.NotificationUnsubscriptions.Remove(unsubscription);
            await dbContext.SaveChangesAsync();
        }
        
        // If no unsubscription exists and we want to unsubscribe the user, add a new unsubscription
        else if (unsubscription == null && unsubscribed)
        {
            dbContext.NotificationUnsubscriptions.Add(new NotificationUnsubscription
            {
                UserId = userId,
            });
            await dbContext.SaveChangesAsync();
        }
    }

    public async Task<bool> GetUnsubscriptionState(ulong userId)
    {
        // Check if user unsubscription exists
        var unsubscription = await dbContext.NotificationUnsubscriptions.FirstOrDefaultAsync(nu => nu.UserId == userId);

        // Return true if an unsubscription exists, false otherwise
        return unsubscription != null;
    }

    public async Task AddSubscriptionPreference(INotificationChannelSubscription subscription, bool enabled)
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

    public Task UpsertSubscriptionPreference(INotificationChannelSubscription subscription, bool enabled)
    {
        throw new NotImplementedException();
    }

    public async Task RemoveSubscriptionPreference(INotificationChannelSubscription subscription)
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

    public async Task<AutoSubscriptionPreference> GetAutoSubscriptionPreference<TAutoSubscription, TChannel>(ulong userId, bool defaultValue) where TAutoSubscription : IAutoSubscription<TChannel> where TChannel : INotificationChannel
    {
        var autoSubscriptionEventName = TAutoSubscription.AutoSubscriptionEventName;
        var channelName = TChannel.ChannelName;
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

    public async Task SetAutoSubscriptionPreference<TAutoSubscription, TChannel>(ulong userId, bool isSubscribed) where TAutoSubscription : IAutoSubscription<TChannel> where TChannel : INotificationChannel
    {
        var (subscription, isSubscriptionSubscribed) = await GetAutoSubscriptionPreference<TAutoSubscription, TChannel>(userId, isSubscribed);
        if (isSubscriptionSubscribed != isSubscribed)
        {
            subscription.Enabled = isSubscribed;
            dbContext.Update(subscription);
            await dbContext.SaveChangesAsync();
        }
    }
}
