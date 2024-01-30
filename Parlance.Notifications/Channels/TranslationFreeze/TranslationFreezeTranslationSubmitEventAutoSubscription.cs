using MessagePipe;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Parlance.Notifications.Service;
using Parlance.Project.Events;

namespace Parlance.Notifications.Channels.TranslationFreeze;

public class TranslationFreezeTranslationSubmitEventAutoSubscription(
    IAsyncSubscriber<TranslationSubmitEvent> translationSubmitEventSubscriber,
    IServiceProvider serviceProvider) : IHostedService, IAsyncMessageHandler<TranslationSubmitEvent>, IAutoSubscription<TranslationFreezeNotificationChannel>
{
    public static string AutoSubscriptionEventName => "TranslationSubmit";
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
        
        var subscription = await notificationService.GetAutoSubscriptionPreference<TranslationFreezeTranslationSubmitEventAutoSubscription, TranslationFreezeNotificationChannel>(message.User.Id, true);
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
