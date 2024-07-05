using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Parlance.Database.Models;

public class ProjectBranch
{
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Key]
    public Guid Id { get; set; }

    public Guid? ProjectId { get; set; }
    public Project? Project { get; set; }
    
    public string BranchName { get; set; }
    
    public string Worktree { get; set; }
    
    public bool DefaultBranch { get; set; }
}