using System.ComponentModel.DataAnnotations;

namespace Parlance.Models;

public class Superuser
{
    [Key]
    public string Username { get; set; }
}