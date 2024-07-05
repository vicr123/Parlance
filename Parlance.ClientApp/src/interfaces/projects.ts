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

export interface LanguageMeta {
    language: string;
    languageName: string;
    completionData: CompletionData;
}

export interface LanguageProjectMeta {
    deadline?: number;
    name: string;
    systemName: string;
    subprojects: LanguageSubprojectMeta[];
    error?: any;
}

export interface LanguageSubprojectMeta {
    name: string;
    preferRegionAgnosticLanguage: boolean;
    realLocale: string;
    systemName: string;
    completionData: CompletionData;
}
