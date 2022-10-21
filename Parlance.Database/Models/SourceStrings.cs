using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Parlance.Database.Models;

public class SourceStrings
{
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Key]
    public Guid Id { get; set; }

    public string Project { get; set; }
    public string Subproject { get; set; }
    public string Language { get; set; }
    public string Key { get; set; }
    public string SourceTranslation { get; set; }
}