export interface VersionControlState {
    latestLocalCommit: Commit;
    latestRemoteCommit: Commit;
    ahead: number;
    behind: number;
    changedFiles: string[];
    lastWebhook?: Webhook;
}

export interface Commit {
    commitIdentifier: string;
    commitMessage: string;
}

export interface Webhook {
    payload: string;
    source: string;
    receivedAt: string;
}
