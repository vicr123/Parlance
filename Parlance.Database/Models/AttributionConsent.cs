using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Parlance.Database.Models;

[Index(nameof(UserId), IsUnique = true)]
public class AttributionConsent
{
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Key]
    public Guid Id { get; set; }

    public ulong UserId { get; set; }
    public string? PreferredName { get; set; }
}