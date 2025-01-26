export type ClientError = GenericClientError | InvalidRefClientError;

interface GenericClientError {
    error:
        | "UnknownUser"
        | "PermissionAlreadyGranted"
        | "GitError"
        | "UsernameAlreadyExists"
        | "TwoFactorIsDisabled"
        | "TwoFactorAlreadyEnabled"
        | "TwoFactorAlreadyDisabled"
        | "TwoFactorCodeIncorrect"
        | "NonFastForwardableError"
        | "MergeConflict"
        | "DirtyWorkingTree"
        | "BadTokenRequestType"
        | "IncorrectParameters";
    extraData: string;
}

interface InvalidRefClientError {
    error: "InvalidRef";
    extraData: {
        ref: string;
    };
}
