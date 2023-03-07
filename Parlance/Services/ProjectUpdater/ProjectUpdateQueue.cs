using System.Threading.Channels;
using Parlance.Project;

namespace Parlance.Services.ProjectUpdater;

public class ProjectUpdateQueue : IProjectUpdateQueue
{
    private readonly Channel<Database.Models.Project> _queue;

    public ProjectUpdateQueue()
    {
        //TODO: Options
        _queue = Channel.CreateBounded<Database.Models.Project>(new BoundedChannelOptions(100)
        {
            FullMode = BoundedChannelFullMode.Wait
        });
    }

    public async Task Queue(Database.Models.Project project)
    {
        await _queue.Writer.WriteAsync(project);
    }

    public async Task<Database.Models.Project> Dequeue(CancellationToken cancellationToken)
    {
        return await _queue.Reader.ReadAsync(cancellationToken);
    }
}