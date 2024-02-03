using System.Reflection;
using Microsoft.EntityFrameworkCore;
using Parlance.Database;
using Parlance.Database.Models;
using Parlance.Notifications.Channels;
using Parlance.Notifications.Channels.TranslationFreeze;
using Parlance.Notifications.Generated;

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

    public IEnumerable<AutoSubscription> GetAutoSubscriptions()
    {
        return AutoSubscriptionRepository.AutoSubscriptions.Select(x => new AutoSubscription(x.Item1, x.Item2));
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

    public async Task<AutoSubscriptionPreference> GetAutoSubscriptionPreference(string channel, string @event,
        ulong userId, bool defaultValue)
    {
        var entry = await dbContext.NotificationEventAutoSubscriptions.FirstOrDefaultAsync(
            x => x.Event == @event && x.UserId == userId && x.Channel == channel);

        if (entry is null)
        {
            // Insert a new entry
            entry = new NotificationEventAutoSubscription
            {
                Enabled = defaultValue,
                Channel = channel,
                Event = @event,
                UserId = userId
            };
            dbContext.NotificationEventAutoSubscriptions.Add(entry);
            await dbContext.SaveChangesAsync();
        }

        return new AutoSubscriptionPreference(entry, entry.Enabled);
    }
    
    public async Task<AutoSubscriptionPreference> GetAutoSubscriptionPreference(NotificationEventAutoSubscription subscriptionAutoSubscriptionSource, ulong userId, bool defaultValue)
    {
        return await GetAutoSubscriptionPreference(subscriptionAutoSubscriptionSource.Channel,
            subscriptionAutoSubscriptionSource.Event, userId, defaultValue);
    }

    public async Task<AutoSubscriptionPreference> GetAutoSubscriptionPreference<TAutoSubscription, TChannel>(ulong userId, bool defaultValue) where TAutoSubscription : IAutoSubscription where TChannel : INotificationChannel
    {
        return await GetAutoSubscriptionPreference(TChannel.ChannelName, TAutoSubscription.AutoSubscriptionEventName, userId, defaultValue);
    }
    
    public async Task<AutoSubscriptionPreference> GetAutoSubscriptionPreference(Type autoSubscriptionType, Type channelType, ulong userId, bool defaultValue)
    {
        // Get static properties using Reflection
        var autoSubscriptionEventNameProperty = autoSubscriptionType.GetProperty("AutoSubscriptionEventName", BindingFlags.Public | BindingFlags.Static);
        var channelNameProperty = channelType.GetProperty("ChannelName", BindingFlags.Public | BindingFlags.Static);

        // Check if the properties exist
        if (autoSubscriptionEventNameProperty == null || channelNameProperty == null)
        {
            throw new ArgumentException("The required static properties do not exist in the provided types.");
        }

        // Get the values of the static properties
        var autoSubscriptionEventName = (string)autoSubscriptionEventNameProperty.GetValue(null!)!;
        var channelName = (string)channelNameProperty.GetValue(null!)!;

        // Call the original function
        return await GetAutoSubscriptionPreference(channelName, autoSubscriptionEventName, userId, defaultValue);
    }

    public async Task SetAutoSubscriptionPreference<TAutoSubscription, TChannel>(ulong userId, bool isSubscribed) where TAutoSubscription : IAutoSubscription where TChannel : INotificationChannel
    {
        await SetAutoSubscriptionPreference(new()
        {
            Channel = TChannel.ChannelName,
            Event = TAutoSubscription.AutoSubscriptionEventName
        }, userId, isSubscribed);
    }
}
