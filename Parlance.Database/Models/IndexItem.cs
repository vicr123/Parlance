using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Parlance.Database.Models;

public enum IndexItemType
{
    Warning,
    Error,
    CumulativeWarning, //Warnings not superseded by errors
    PassedChecks,
    Complete,
    TranslationString
}

public class IndexItem
{
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Key]
    public Guid Id { get; set; }

    public string Project { get; set; } = null!;
    public string Subproject { get; set; } = null!;
    public string Language { get; set; } = null!;
    public string ItemIdentifier { get; set; } = null!;
    public IndexItemType RecordType { get; set; }
    public string? Record { get; set; } = null!;
}