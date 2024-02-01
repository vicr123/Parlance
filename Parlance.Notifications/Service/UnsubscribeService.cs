using JetBrains.Annotations;
using JWT.Algorithms;
using JWT.Builder;
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

        return dbContext.NotificationSubscriptions.SingleOrDefault(s => s.Id == id);
    }
}

[UsedImplicitly]
file class UnsubscribeJwtData
{
    public required string Id { get; set; }
}
