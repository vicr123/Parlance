using System.Runtime.Serialization;

namespace Parlance.Project.Exceptions;

public class ParlanceJsonFileParseException : Exception
{
    public ParlanceJsonFileParseException()
    {
    }

    public ParlanceJsonFileParseException(string? message) : base(message)
    {
    }

    public ParlanceJsonFileParseException(string? message, Exception? innerException) : base(message, innerException)
    {
    }
}