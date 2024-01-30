using MessagePipe;
using Microsoft.Extensions.Hosting;
using Parlance.VersionControl.Events;

namespace Parlance.Notifications.Channels.TranslationFreeze;

public class TranslationFreezeNotificationChannel(IAsyncSubscriber<ProjectMetadataFileChangedEvent> projectMetadataFileChangedEventSubscriber) : INotificationChannel, IHostedService, IAsyncMessageHandler<ProjectMetadataFileChangedEvent>
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

    public ValueTask HandleAsync(ProjectMetadataFileChangedEvent message, CancellationToken cancellationToken)
    {
        if (message.OldProject?.Deadline != message.NewProject?.Deadline && message.NewProject?.Deadline is not null)
        {
            // Trigger notification
        }
        return ValueTask.CompletedTask;
    }

}
