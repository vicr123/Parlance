using Parlance.Database.Models;
using Parlance.Notifications.Channels;

namespace Parlance.Notifications.Service;

public interface IUnsubscribeService
{
    string GenerateUnsubscribeToken(INotificationChannelSubscriptionBase subscription);
    NotificationSubscription? UnsubscribeData(string token);
    
    Task SetUnsubscriptionState(ulong userId, bool unsubscribed);
    Task<bool> GetUnsubscriptionState(ulong userId);

}