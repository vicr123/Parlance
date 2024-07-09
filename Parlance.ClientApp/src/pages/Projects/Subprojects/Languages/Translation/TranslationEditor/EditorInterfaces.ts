import { TranslationEntry } from "@/interfaces/projects";

export interface SearchParams {
    query?: string;
    filter?: string;
}

export type PushUpdateFunction = (
    key: string,
    update: TranslationUpdate,
) => Promise<void>;

export interface TranslationUpdate {
    translationStrings: TranslationEntry;
    forceUpdate?: boolean;
}

export interface PlaceholderInterface {
    number: number;
    placeholder: any;
}

export interface PluralExample {
    explanation: string;
    number: number;
}
