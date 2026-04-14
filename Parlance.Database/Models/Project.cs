using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Parlance.Database.Interfaces;

namespace Parlance.Database.Models;

public class Project : IVcsable
{
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Key]
    public Guid Id { get; set; }

    public string? VcsDirectory { get; set; }

    Project IVcsable.Project => this;

    public string Name { get; set; } = null!;

    public string? SystemName { get; set; }

    public List<ProjectMaintainer> Maintainers { get; set; } = null!;

    public List<Glossary> Glossaries { get; set; } = new();

    public List<ProjectBranch> Branches { get; set; } = new();
    
    
}