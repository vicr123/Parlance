using System.ComponentModel.DataAnnotations;

namespace Parlance.Database.Models;

public class NotificationUnsubscription
{
    [Key]
    public ulong UserId { get; set; }
}
