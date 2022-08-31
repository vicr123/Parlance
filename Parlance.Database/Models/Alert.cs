using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Parlance.Database.Models;

public enum AlertType
{
    VersionControlPullFailure
}

public class Alert
{
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Key]
    public Guid Id { get; set; }

    public string Project { get; set; } = null!;
    public AlertType AlertType { get; set; }
    public string AlertMessage { get; set; } = null!;
}