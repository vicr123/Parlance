using Parlance.Database.Models;

namespace Parlance.Database.Interfaces;

public interface IVcsable
{
    string? SystemName { get; }
    
    string? VcsDirectory { get; }
    
    Project Project { get; }
}