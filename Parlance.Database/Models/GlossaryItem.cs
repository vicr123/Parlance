using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Parlance.Database.Models;

public enum PartOfSpeech
{
    Other = 0,
    Noun,
    Verb,
    Adjective
}

public class GlossaryItem
{
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Key]
    public Guid Id { get; set; }

    public string Term { get; set; } = null!;

    public PartOfSpeech PartOfSpeech { get; set; }

    public string Translation { get; set; } = null!;

    public string Language { get; set; } = null!;
    
    public Guid GlossaryId { get; set; }

    public Glossary Glossary { get; set; } = null!;
}