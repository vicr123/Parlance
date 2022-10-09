using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Parlance.Database.Models;

public class SecurityKey
{
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Key]
    public Guid Id { get; set; }

    public string Name { get; set; }
    public ulong UserId { get; set; }
    public byte[] PublicKey { get; set; }
    public uint Counter { get; set; }
    public string CredType { get; set; }
    public DateTime RegistrationDate { get; set; }
    public Guid AaGuid { get; set; }
    public byte[] CredentialId { get; set; }
    public byte[] UserHandle { get; set; }
}