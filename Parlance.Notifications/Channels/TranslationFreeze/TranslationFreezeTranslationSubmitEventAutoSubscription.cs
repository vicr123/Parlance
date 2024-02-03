using MessagePipe;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Parlance.Notifications.Generated;
using Parlance.Notifications.Service;
using Parlance.Project.Events;

namespace Parlance.Notifications.Channels.TranslationFreeze;

[AutoSubscription(typeof(TranslationFreezeNotificationChannel))]
public class TranslationFreezeTranslationSubmitEventAutoSubscription(
    IAsyncSubscriber<TranslationSubmitEvent> translationSubmitEventSubscriber,
    IServiceProvider serviceProvider) : IHostedService, IAsyncMessageHandler<TranslationSubmitEvent>, IAutoSubscription
{
    public static string AutoSubscriptionEventName => "TranslationSubmit";
    public static bool SubscribedByDefault => true;
    private IDisposable? _translationSubmitEventSubscriberSubscription;
    
    public Task StartAsync(CancellationToken cancellationToken)
    {
        _translationSubmitEventSubscriberSubscription = translationSubmitEventSubscriber.Subscribe(this);
        return Task.CompletedTask;
    }

    public Task StopAsync(CancellationToken cancellationToken)
    {
        _translationSubmitEventSubscriberSubscription?.Dispose();
        return Task.CompletedTask;
    }

    public async ValueTask HandleAsync(TranslationSubmitEvent message, CancellationToken cancellationToken)
    {
        await using var scope = serviceProvider.CreateAsyncScope();
        var notificationService = scope.ServiceProvider.GetRequiredService<INotificationService>();
        
        var subscription = await notificationService.GetAutoSubscriptionPreference<TranslationFreezeTranslationSubmitEventAutoSubscription, TranslationFreezeNotificationChannel>(message.User.Id);
        if (!subscription.IsSubscribed)
        {
            return;
        }

        try
        {
            // Automatically subscribe this user to translation freezes if they haven't explicitly unsubscribed
            await notificationService.AddSubscriptionPreference(
                new TranslationFreezeNotificationChannelSubscription(message.User.Id,
                    TranslationFreezeNotificationChannel.ChannelName, message.Project.SystemName, subscription.Subscription), true);
        }
        catch (DbUpdateException)
        {
            
        }
    }
}
