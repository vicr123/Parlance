using MessagePipe;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Parlance.Project.Events;

namespace Parlance.Project.SourceStrings;

public class ParlanceSourceStringsTranslationSubmitEventSubscriber(
    IAsyncSubscriber<TranslationSubmitEvent> subscriber,
    IServiceProvider serviceProvider) : IHostedService, IAsyncMessageHandler<TranslationSubmitEvent>
{
    private IDisposable? _handler;
    
    public Task StartAsync(CancellationToken cancellationToken)
    {
        _handler = subscriber.Subscribe(this);
        return Task.CompletedTask;
    }

    public Task StopAsync(CancellationToken cancellationToken)
    {
        _handler?.Dispose();
        return Task.CompletedTask;
    }

    public async ValueTask HandleAsync(TranslationSubmitEvent message, CancellationToken cancellationToken)
    {
        await using var scope = serviceProvider.CreateAsyncScope();
        var sourceStringsService = scope.ServiceProvider.GetRequiredService<IParlanceSourceStringsService>();
        await sourceStringsService.RegisterSourceStringChange(message.SubprojectLanguage, message.Entry);
    }
}