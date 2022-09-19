using Parlance.Project;

namespace Parlance.Services.ProjectUpdater;

public interface IProjectUpdateQueue
{
    public Task Queue(IParlanceProject project);
    public Task<IParlanceProject> Dequeue(CancellationToken cancellationToken);
}