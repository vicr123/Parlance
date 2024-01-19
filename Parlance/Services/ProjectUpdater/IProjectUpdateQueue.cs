namespace Parlance.Services.ProjectUpdater;

public interface IProjectUpdateQueue
{
    public Task Queue(Database.Models.Project project);
    public Task<Database.Models.Project> Dequeue(CancellationToken cancellationToken);
}