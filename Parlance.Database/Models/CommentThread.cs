using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Parlance.Database.Models;

public class CommentThread
{
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Key]
    public Guid Id { get; set; }

    public string Project { get; set; } = null!;
    public string Subproject { get; set; } = null!;
    public string Language { get; set; } = null!;
    public string Key { get; set; } = null!;
    public string Title { get; set; } = null!;
    public bool IsFlagged { get; set; }
    public bool IsClosed { get; set; }
    public List<Comment> Comments { get; set; } = null!;
    public List<CommentThreadSubscription> Subscriptions { get; set; } = null!;
}