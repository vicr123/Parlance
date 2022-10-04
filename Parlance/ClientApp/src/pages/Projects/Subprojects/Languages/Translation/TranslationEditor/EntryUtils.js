import {useNavigate, useParams} from "react-router-dom";

export default function useTranslationEntries(entries) {
    const {project, subproject, language, key} = useParams();
    const navigate = useNavigate();

    const goToEntry = key => {
        navigate(`/projects/${project}/${subproject}/${language}/translate/${key}`, {replace: true});
    }

    const entryIndex = entries.findIndex(entry => entry.key === key);
    const entry = entries[entryIndex];
    const nextUnfinished = entries.find((entry, idx) => idx > entryIndex && entry.translation.every(translation => translation?.translationContent === ""));
    const prevUnfinished = entries.findLast((entry, idx) => idx < entryIndex && entry.translation.every(translation => translation?.translationContent === ""));

    return {
        entryIndex,
        entry,
        nextUnfinished,
        prevUnfinished,
        goToEntry,
        goToPrevUnfinished: () => {
            if (!prevUnfinished) return;
            goToEntry(prevUnfinished.key);
        },
        goToNextUnfinished: () => {
            if (!nextUnfinished) return;
            goToEntry(nextUnfinished.key);
        }
    }
} 