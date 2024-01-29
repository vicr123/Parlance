using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Parlance.Database.Models;

public class NotificationEventAutoSubscription
{
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Key]
    public Guid Id { get; set; }
    
    public bool Enabled { get; set; }
    
    public string Event { get; set; }
    
    public string Channel { get; set; }
    
    public ulong UserId { get; set; }
}
