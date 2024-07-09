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

export type PluralType = "zero" | "one" | "two" | "few" | "many" | "other";

export interface BaseEntry {
    key: string;
    context: string;
    source: string;
    oldSourceString?: string;
    translation: TranslationEntry;
}

interface SingularTranslationEntry {
    pluralType: "singular";
    translationContent: string;
}

interface SingularEntry extends BaseEntry {
    requiresPluralisation: false;
    translation: [SingularTranslationEntry];
}

interface PluralTranslationEntry {
    pluralType: PluralType;
    translationContent: string;
}

interface PluralEntry extends BaseEntry {
    requiresPluralisation: true;
    translation: PluralTranslationEntry[];
}

export type Entry = SingularEntry | PluralEntry;
export type TranslationEntry =
    | [SingularTranslationEntry]
    | PluralTranslationEntry[];

export interface AssistantSuggestion {
    type: string;
    source: string;
    translation: string;
}

export interface PartialProjectResponse {
    completionData: CompletionData;
    name: string;
    systemName: string;
    deadline: number | null;
}

export interface ProjectResponse {
    completionData: CompletionData;
    name: string;
    deadline: number | null;
    isProjectManager: boolean;
    canManage: boolean;
    subprojects: {
        completionData: CompletionData;
        systemName: string;
        name: string;
    }[];
}

export interface SubprojectResponse {
    completionData: CompletionData;
    translationFileType: string;
    name: string;
    preferRegionAgnosticLanguage: boolean;
    projectName: string;
    availableLanguages: LanguageMeta[];
}

export interface SubprojectLanguageResponse {
    completionData: CompletionData;
    projectName: string;
    subprojectName: string;
    language: string;
    canEdit: boolean;
    openThreads: Thread[];
}
