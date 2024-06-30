import { Thread } from "./comments";

export interface SubprojectLocaleMeta {
    completionData: CompletionData;
    projectName: string;
    subprojectName: string;
    language: string;
    canEdit: boolean;
    openThreads: Thread[];
}

export interface CompletionData {
    count: number;
    complete: number;
    warnings: number;
    errors: number;
    cumulativeWarnings: number;
    passedChecks: number;
    needsAttention: number;
}
