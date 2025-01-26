namespace Parlance.VersionControl.Services.VersionControl;

public class InvalidRefException : InvalidOperationException
{
    public InvalidRefException()
    {
    }

    public InvalidRefException(string? message) : base(message)
    {
    }

    public InvalidRefException(string? message, Exception? innerException) : base(message, innerException)
    {
    }
    
    public required string Ref { get; init; }
}
