using Parlance.Project;

namespace Parlance.VersionControl.Events;

public class ProjectMetadataFileChangedEvent
{
    public required IParlanceProject? OldProject { get; set; }
    
    public required IParlanceProject? NewProject { get; set; }

    public required string ProjectSystemName { get; set; }
}
