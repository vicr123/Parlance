using System.Text.Json.Serialization;
using JetBrains.Annotations;
using JWT.Algorithms;
using JWT.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Parlance.Database;
using Parlance.Database.Models;
using Parlance.Notifications.Channels;

namespace Parlance.Notifications.Service;

public class UnsubscribeService(ParlanceContext dbContext, IOptions<EmailOptions> emailOptions) : IUnsubscribeService
{
    public string GenerateUnsubscribeToken(INotificationChannelSubscriptionBase subscription)
    {
        return JwtBuilder.Create()
            .WithAlgorithm(new HMACSHA512Algorithm())
            .WithSecret(emailOptions.Value.UnsubscribeTokenSecret)
            .AddClaim("id", subscription.Id.ToString("N"))
            .Encode();
    }

    public NotificationSubscription? UnsubscribeData(string token)
    {
        var decodedToken = JwtBuilder.Create()
            .WithAlgorithm(new HMACSHA512Algorithm())
            .WithSecret(emailOptions.Value.UnsubscribeTokenSecret)
            .MustVerifySignature()
            .Decode<UnsubscribeJwtData>(token);

        if (!Guid.TryParse(decodedToken.Id, out var id))
        {
            return null;
        }

        return dbContext.NotificationSubscriptions.Include(x => x.AutoSubscriptionSource).SingleOrDefault(s => s.Id == id);
    }
    
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

[UsedImplicitly]
file class UnsubscribeJwtData
{
    [JsonPropertyName("id")]
    public required string Id { get; set; }
}
