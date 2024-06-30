export enum PartOfSpeech {
    Unknown = 0,
    Noun,
    Verb,
    Adjective,
}

export interface Glossary {
    id: string;
    name: string;
    createdDate: string;
    usedByProjects: number;
}

export interface GlossaryItem {
    id: string;
    term: string;
    translation: string;
    partOfSpeech: PartOfSpeech;
    lang: string;
}

export function PartOfSpeechTranslationString(pos: PartOfSpeech) {
    switch (pos) {
        case PartOfSpeech.Noun:
            return "PART_OF_SPEECH_NOUN";
        case PartOfSpeech.Verb:
            return "PART_OF_SPEECH_VERB";
        case PartOfSpeech.Adjective:
            return "PART_OF_SPEECH_ADJECTIVE";
        case PartOfSpeech.Unknown:
            return "PART_OF_SPEECH_UNKNOWN";
    }
}
