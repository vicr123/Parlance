using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Parlance.Database.Models;

public class Project
{
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Key]
    public Guid Id { get; set; }

    public string VcsDirectory { get; set; } = null!;

    public string Name { get; set; } = null!;

    public string SystemName { get; set; } = null!;

    public List<ProjectMaintainer> Maintainers { get; set; } = null!;

    public List<Glossary> Glossaries { get; set; } = new();
}