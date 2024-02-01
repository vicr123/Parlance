using Microsoft.Extensions.Options;
using Parlance.CldrData;
using Parlance.Notifications.Channels;
using Parlance.Notifications.Email;
using Parlance.Vicr123Accounts.Services;

namespace Parlance.Notifications.Service;

public class EmailService(IVicr123AccountsService accountsService, IUnsubscribeService unsubscribeService, IOptions<EmailOptions> emailOptions) : IEmailService
{
    public async Task SendEmailNotification<TChannel>(INotificationChannelSubscriptionBase subscription,
        Locale locale, object args) where TChannel : INotificationChannel
    {
        var user = await accountsService.UserById(subscription.UserId);
        var email = new NotificationEmail(user, emailOptions.Value, unsubscribeService.GenerateUnsubscribeToken(subscription), locale, TChannel.ChannelName, args);
        await accountsService.SendEmail(user, (emailOptions.Value.FromAddress, emailOptions.Value.FromName), email.Subject, email.Body,
            email.HtmlBody);
    }
}
