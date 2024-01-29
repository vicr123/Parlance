using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Parlance.Database.Models;

public class NotificationSubscription
{
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Key]
    public Guid Id { get; set; }
    
    public bool Enabled { get; set; }
    
    public ulong UserId { get; set; }
    
    public string? EventSource { get; set; }
    
    public string Channel { get; set; }
    
    public string SubscriptionData { get; set; }
}
