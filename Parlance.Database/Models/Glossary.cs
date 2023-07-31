using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Parlance.Database.Models;

[Index(nameof(Name), IsUnique = true)]
public class Glossary
{
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Key]
    public Guid Id { get; set; }

    public required string Name { get; set; }

    public required DateTimeOffset CreatedDate { get; set; }

    public List<GlossaryItem> GlossaryItems { get; set; } = new();

    public List<Project> Projects { get; set; } = new();
}
