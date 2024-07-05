import { useNavigate, useParams } from "react-router-dom";
import { isEmptyTranslation } from "./EntryHelper.js";
import { useMemo } from "react";
import { checkTranslation, mostSevereType } from "@/checks";
import { Entry } from "@/interfaces/projects";
import { PushUpdateFunction, SearchParams } from "./EditorInterfaces";

export default function useTranslationEntries(
    entries: Entry[],
    searchParams: SearchParams,
    translationFileType: string,
    onPushUpdate: PushUpdateFunction,
) {
    const { project, subproject, language, key } = useParams();
    const navigate = useNavigate();

    const goToEntry = (key: string) => {
        navigate(
            `/projects/${project}/${subproject}/${language}/translate/${key}`,
            { replace: true },
        );
    };

    const entryIndex = entries.findIndex(entry => entry.key === key);
    const entry = entries[entryIndex];
    const filteredEntries = useMemo(
        () =>
            entries
                .filter(entry => {
                    switch (searchParams.filter) {
                        case "all":
                            return true;
                        case "unfinished":
                            return isEmptyTranslation(entry);
                        case "alerts":
                            let mostSevereCheck = mostSevereType(
                                entry.translation.map(pform =>
                                    mostSevereType(
                                        checkTranslation(
                                            entry.source,
                                            pform.translationContent,
                                            translationFileType,
                                        ),
                                    ),
                                ),
                            );
                            switch (mostSevereCheck) {
                                case "error":
                                case "warn":
                                    return true;
                                default:
                                    return false;
                            }
                    }
                })
                .filter(entry => {
                    if (!searchParams.query) return true;
                    return entry.source
                        .toLowerCase()
                        .includes(searchParams.query.toLowerCase());
                }),
        [entries, searchParams],
    );
    const next =
        entries.find(
            (entry, idx) => idx > entryIndex && filteredEntries.includes(entry),
        ) || filteredEntries[0];
    const prev =
        entries.findLast(
            (entry, idx) => idx < entryIndex && filteredEntries.includes(entry),
        ) || filteredEntries[filteredEntries.length - 1];
    const nextUnfinished = entries.find(
        (entry, idx) =>
            idx > entryIndex &&
            isEmptyTranslation(entry) &&
            filteredEntries.includes(entry),
    );
    const prevUnfinished = entries.findLast(
        (entry, idx) =>
            idx < entryIndex &&
            isEmptyTranslation(entry) &&
            filteredEntries.includes(entry),
    );

    return {
        entryIndex,
        entry,
        filteredEntries,
        next,
        prev,
        nextUnfinished,
        prevUnfinished,
        goToEntry,
        goToNext: () => {
            if (!next) return;
            goToEntry(next.key);
        },
        goToPrev: () => {
            if (!prev) return;
            goToEntry(prev.key);
        },
        goToPrevUnfinished: () => {
            if (!prevUnfinished) return;
            goToEntry(prevUnfinished.key);
        },
        goToNextUnfinished: () => {
            if (entry.oldSourceString) {
                onPushUpdate(key!, {
                    translationStrings: entry.translation.map(pform2 => ({
                        pluralType: pform2.pluralType,
                        translationContent: pform2.translationContent,
                    })),
                    forceUpdate: true,
                });
            }

            if (!nextUnfinished) return;
            goToEntry(nextUnfinished.key);
        },
    };
}
