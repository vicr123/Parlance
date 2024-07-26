using Microsoft.AspNetCore.Mvc;

namespace Parlance.Helpers;

public enum ParlanceClientError
{
    UnknownUser,
    PermissionAlreadyGranted,
    GitError,
    BranchNotFound,
    UsernameAlreadyExists,
    TwoFactorIsDisabled,
    TwoFactorAlreadyEnabled,
    TwoFactorAlreadyDisabled,
    TwoFactorCodeIncorrect,
    NonFastForwardableError,
    MergeConflict,
    DirtyWorkingTree,
    BadTokenRequestType,
    IncorrectParameters
}

public static class ControllerExtensions
{
    public static BadRequestObjectResult ClientError(this Controller controller, ParlanceClientError errorType,
        object? extraData = null)
    {
        return controller.BadRequest(new
        {
            Error = errorType.ToString(),
            ExtraData = extraData
        });
    }
}
