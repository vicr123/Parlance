import { BaseEntry, BaseTranslationEntry } from "@/interfaces/projects";

function isEmptyTranslation(entry: BaseEntry) {
    return (
        (entry.translation as BaseTranslationEntry[]).every(
            entry => entry.translationContent === "",
        ) || entry.oldSourceString
    );
}

export { isEmptyTranslation };
