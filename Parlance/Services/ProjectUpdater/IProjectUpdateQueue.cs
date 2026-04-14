using Parlance.Database.Interfaces;

namespace Parlance.Services.ProjectUpdater;

public interface IProjectUpdateQueue
{
    public Task Queue(IVcsable project);
    public Task<IVcsable> Dequeue(CancellationToken cancellationToken);
}