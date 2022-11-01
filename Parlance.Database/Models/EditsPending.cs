using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Parlance.Database.Models;

[Index(nameof(UserId), nameof(Project), nameof(Subproject), nameof(Language), IsUnique = true)]
public class EditsPending
{
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Key]
    public Guid Id { get; set; }

    public ulong UserId { get; set; }
    public string Project { get; set; } = null!;
    public string Subproject { get; set; } = null!;
    public string Language { get; set; } = null!;
}