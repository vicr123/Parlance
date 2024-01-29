namespace Parlance.Notifications.Service;

public interface INotificationService
{
    Task SetUnsubscriptionState(ulong userId, bool unsubscribed);
    Task<bool> GetUnsubscriptionState(ulong userId);
}
