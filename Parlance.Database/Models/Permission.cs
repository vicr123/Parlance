using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Parlance.Database.Models;

[Index(nameof(UserId), nameof(PermissionType), nameof(SpecificPermission), IsUnique = true)]
public class Permission
{
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Key]
    public Guid Id { get; set; }

    public ulong UserId { get; set; }
    
    public string PermissionType { get; set; } = null!;
    
    public string SpecificPermission { get; set; } = null!;
}