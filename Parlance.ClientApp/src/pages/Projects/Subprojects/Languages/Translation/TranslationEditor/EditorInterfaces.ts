import { TranslationEntry } from "@/interfaces/projects";

export interface SearchParams {
    query?: string;
    filter?: string;
}

export type PushUpdateFunction = (
    key: string,
    update: {
        translationStrings: TranslationEntry[];
        forceUpdate: boolean;
    },
) => Promise<void>;
