using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Parlance.Database.Models;

public class Comment
{
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Key]
    public Guid Id { get; set; }

    public string Text { get; set; }

    public long Date { get; set; }
    public ulong UserId { get; set; }
    public string? Event { get; set; }

    public Guid ThreadId { get; set; }
    public CommentThread Thread { get; set; } = null!;
}