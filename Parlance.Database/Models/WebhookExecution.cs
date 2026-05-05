using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Parlance.Database.Models;

public class WebhookExecution
{
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Key]
    public Guid Id { get; set; }
    
    public Project Parent { get; set; }
    
    public DateTimeOffset ReceivedAt { get; set; }
    
    public string Source { get; set; }
    
    public string Payload { get; set; }
}