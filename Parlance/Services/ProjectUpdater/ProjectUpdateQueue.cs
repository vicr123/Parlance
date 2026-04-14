using System.Threading.Channels;
using Parlance.Database.Interfaces;

namespace Parlance.Services.ProjectUpdater;

public class ProjectUpdateQueue : IProjectUpdateQueue
{
    private readonly Channel<IVcsable> _queue;

    public ProjectUpdateQueue()
    {
        //TODO: Options
        _queue = Channel.CreateBounded<IVcsable>(new BoundedChannelOptions(100)
        {
            FullMode = BoundedChannelFullMode.Wait
        });
    }

    public async Task Queue(IVcsable project)
    {
        await _queue.Writer.WriteAsync(project);
    }

    public async Task<IVcsable> Dequeue(CancellationToken cancellationToken)
    {
        return await _queue.Reader.ReadAsync(cancellationToken);
    }
}