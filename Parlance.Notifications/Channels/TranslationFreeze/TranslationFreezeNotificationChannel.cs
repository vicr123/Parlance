using MessagePipe;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Parlance.CldrData;
using Parlance.Notifications.Service;
using Parlance.VersionControl.Events;

namespace Parlance.Notifications.Channels.TranslationFreeze;

public class TranslationFreezeNotificationChannel(
    IAsyncSubscriber<ProjectMetadataFileChangedEvent> projectMetadataFileChangedEventSubscriber,
    IServiceProvider serviceProvider)
    : INotificationChannel, IHostedService, IAsyncMessageHandler<ProjectMetadataFileChangedEvent>
{
    public static string ChannelName => "TranslationFreeze";
    private IDisposable? _projectMetadataFileChangedEventSubscriberSubscription;
    
    public Task StartAsync(CancellationToken cancellationToken)
    {
        _projectMetadataFileChangedEventSubscriberSubscription =
            projectMetadataFileChangedEventSubscriber.Subscribe(this);
        return Task.CompletedTask;
    }

    public Task StopAsync(CancellationToken cancellationToken)
    {
        _projectMetadataFileChangedEventSubscriberSubscription?.Dispose();
        return Task.CompletedTask;
    }

    public async ValueTask HandleAsync(ProjectMetadataFileChangedEvent message, CancellationToken cancellationToken)
    {
        // TODO: Ensure deadline is in the future
        if (message.OldProject?.Deadline != message.NewProject?.Deadline && message.NewProject?.Deadline is not null)
        {
            await TriggerNotification(message);
        }
    }

    private async Task TriggerNotification(ProjectMetadataFileChangedEvent message)
    {
        await using var scope = serviceProvider.CreateAsyncScope();
        var notificationService = scope.ServiceProvider.GetRequiredService<INotificationService>();

        await foreach (var subscription in notificationService
                           .SavedSubscriptionPreferences<TranslationFreezeNotificationChannel,
                               TranslationFreezeNotificationChannelSubscription>()
                           .Where(x => x.Project == message.ProjectSystemName))
        {
            var locale = "en-US".ToLocale();
            
            await notificationService.SendEmailNotification<TranslationFreezeNotificationChannel>(subscription.UserId,
                locale, new
                {
                    Project = message.NewProject!.ReadableName,
                    Expiry = message.NewProject!.Deadline!.Value.ToString(locale.ToCultureInfo()),
                    ProjectPageLink = "Project Page Link"
                });
        }
    }
}
