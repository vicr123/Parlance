using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Parlance.Database.Models;

[Index(nameof(ThreadId), nameof(UserId), IsUnique = true)]
public class CommentThreadSubscription
{
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Key]
    public Guid Id { get; set; }

    public Guid ThreadId { get; set; }
    public CommentThread Thread { get; set; } = null!;

    public ulong UserId { get; set; }
}