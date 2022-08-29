using Microsoft.AspNetCore.Mvc;

namespace Parlance.Helpers;

public static class ControllerExtensions
{
    public enum ErrorType
    {
        UnknownUser,
        PermissionAlreadyGranted,
        GitError,
        UsernameAlreadyExists
    }
    
    public static BadRequestObjectResult ClientError(this Controller controller, ErrorType errorType, object? extraData = null)
    {
        return controller.BadRequest(new
        {
            Error = errorType.ToString(),
            ExtraData = extraData
        });
    }
}