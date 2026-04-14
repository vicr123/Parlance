using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Parlance.Database.Interfaces;

namespace Parlance.Database.Models;

public class ProjectBranch : IVcsable
{
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Key]
    public Guid Id { get; set; }
    
    public Project Parent { get; set; }

    public string SystemName { get; set; } = null!;
    
    public string BranchName { get; set; }

    public string VcsDirectory { get; set; } = null!;
    
    public bool IsDefault { get; set; }

    Project IVcsable.Project => Parent;
}