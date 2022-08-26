namespace Parlance.Project.Checks;

public class CheckResult
{
    public enum Severity
    {
        Warning,
        Error
    }
    
    public Severity CheckSeverity { get; set; }
    public string Message { get; set; } = null!;
}

public interface IParlanceChecks
{
    public IEnumerable<CheckResult> CheckTranslation(string source, string translation, string checkSuite);
}