using System.Threading.Channels;
using Parlance.Project;

namespace Parlance.Services.ProjectUpdater;

public class ProjectUpdateQueue : IProjectUpdateQueue
{
    private readonly Channel<IParlanceProject> _queue;

    public ProjectUpdateQueue()
    {
        //TODO: Options
        _queue = Channel.CreateBounded<IParlanceProject>(new BoundedChannelOptions(100)
        {
            FullMode = BoundedChannelFullMode.Wait
        });
    }

    public async Task Queue(IParlanceProject project)
    {
        await _queue.Writer.WriteAsync(project);
    }

    public async Task<IParlanceProject> Dequeue(CancellationToken cancellationToken)
    {
        return await _queue.Reader.ReadAsync(cancellationToken);
    }
}