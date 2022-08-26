using System.ComponentModel.DataAnnotations;

namespace Parlance.Database.Models;

public class Superuser
{
    [Key]
    public string Username { get; set; } = null!;
}