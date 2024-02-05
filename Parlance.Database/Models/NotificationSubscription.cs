using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Parlance.Database.Models;

[Index(nameof(UserId), nameof(Channel), nameof(SubscriptionData), IsUnique = true)]
public class NotificationSubscription
{
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Key]
    public Guid Id { get; set; }
    
    public bool Enabled { get; set; }
    
    public ulong UserId { get; set; }
    
    public string Channel { get; set; }
    
    public string SubscriptionData { get; set; }
    
    public NotificationEventAutoSubscription? AutoSubscriptionSource { get; set; }
}
