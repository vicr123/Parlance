using System.Runtime.Serialization;

namespace Parlance.Project.Exceptions;

public class ParlanceJsonFileParseException : Exception
{
    public ParlanceJsonFileParseException()
    {
    }

    protected ParlanceJsonFileParseException(SerializationInfo info, StreamingContext context) : base(info, context)
    {
    }

    public ParlanceJsonFileParseException(string? message) : base(message)
    {
    }

    public ParlanceJsonFileParseException(string? message, Exception? innerException) : base(message, innerException)
    {
    }
}