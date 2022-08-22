namespace Parlance.Project;

public class SubprojectNotFoundException : InvalidOperationException
{
    
}

public interface IParlanceSubproject
{
    public string SystemName { get; }
}