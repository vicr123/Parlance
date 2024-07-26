export interface VersionControlState {
    latestLocalCommit: Commit;
    latestRemoteCommit: Commit;
    ahead: number;
    behind: number;
    changedFiles: string[];
    branch: string;
    upstreamUrl: string;
}

export interface Commit {
    commitIdentifier: string;
    commitMessage: string;
}
