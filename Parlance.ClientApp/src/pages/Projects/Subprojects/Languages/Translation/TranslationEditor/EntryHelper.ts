import { BaseEntry } from "@/interfaces/projects";

function isEmptyTranslation(entry: BaseEntry) {
    return (
        entry.translation.every(entry => entry.translationContent === "") ||
        entry.oldSourceString
    );
}

export { isEmptyTranslation };
