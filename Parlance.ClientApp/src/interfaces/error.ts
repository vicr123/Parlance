export type ParlanceError = GenericParlanceError | BranchNotFoundError;

interface GenericParlanceError {
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
}

interface BranchNotFoundError {
    error: "BranchNotFound";
    extraData: {
        branch: string;
    };
}
