using Microsoft.EntityFrameworkCore;
using Parlance.Database;
using Parlance.Database.Models;

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
}
