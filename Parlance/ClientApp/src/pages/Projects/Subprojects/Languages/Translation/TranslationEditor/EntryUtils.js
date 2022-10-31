import {useNavigate, useParams} from "react-router-dom";
import {isEmptyTranslation} from "./EntryHelper";

export default function useTranslationEntries(entries, onPushUpdate) {
    const {project, subproject, language, key} = useParams();
    const navigate = useNavigate();

    const goToEntry = key => {
        navigate(`/projects/${project}/${subproject}/${language}/translate/${key}`, {replace: true});
    }

    const entryIndex = entries.findIndex(entry => entry.key === key);
    const entry = entries[entryIndex];
    const next = entries.find((entry, idx) => idx > entryIndex) || entries[0];
    const prev = entries.findLast((entry, idx) => idx < entryIndex) || entries[entries.length - 1];
    const nextUnfinished = entries.find((entry, idx) => idx > entryIndex && isEmptyTranslation(entry));
    const prevUnfinished = entries.findLast((entry, idx) => idx < entryIndex && isEmptyTranslation(entry));

    return {
        entryIndex,
        entry,
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
                onPushUpdate(key, {
                    translationStrings: entry.translation.map(pform2 => ({
                        pluralType: pform2.pluralType,
                        translationContent: pform2.translationContent
                    })),
                    forceUpdate: true
                });
            }

            if (!nextUnfinished) return;
            goToEntry(nextUnfinished.key);
        }
    }
} 