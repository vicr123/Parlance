using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Parlance.Database.Models;

[Index(nameof(ProjectId), nameof(UserId), IsUnique = true)]
public class ProjectMaintainer
{
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Key]
    public Guid Id { get; set; }

    public Guid? ProjectId { get; set; }
    public Project? Project { get; set; }

    public ulong UserId { get; set; }
}