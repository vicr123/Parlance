import {GlossaryItem, PartOfSpeech, PartOfSpeechTranslationString} from "../../../../../../interfaces/glossary";
import {useEffect, useState} from "react";
import posTagger from "wink-pos-tagger"

import Styles from "./GlossaryLookup.module.css"
import SmallButton from "../../../../../../components/SmallButton";
import {useTranslation} from "react-i18next";

interface GlossaryLookupProps {
    glossary: GlossaryItem[]
    sourceString: string
}

interface GlossaryResult {
    id: string
    term: string
    translation: string | null
    partOfSpeech: PartOfSpeech
}

export default function GlossaryLookup({glossary, sourceString}: GlossaryLookupProps) {
    const {t} = useTranslation();
    const [matches, setMatches] = useState<GlossaryResult[]>([]);
    
    useEffect(() => {
        let matches: GlossaryResult[] = glossary.filter(item => new RegExp(`\\b${item.term}\\b`, "iu").exec(sourceString) !== null);
        const tagger = posTagger();
        matches.push(...tagger.tagSentence(sourceString)
            .filter(token => token.tag == "word")
            .filter(token => !glossary.some(x => x.term.toLowerCase() === token.normal.toLowerCase() || x.term.toLowerCase() === token.lemma?.toLowerCase()))
            .filter(token => token.pos === "NN" || token.pos == "VB" || token.pos == "NNP" || token.pos == "VBZ" || token.pos == "NNS")
            .map(token => ({
                id: token.normal,
                term: token.lemma || token.normal,
                translation: null,
                partOfSpeech: PartOfSpeech.Unknown
            })
        ))
        setMatches([...new Map(matches.map(item => [item.term, item])).values()]);
    }, [glossary, sourceString])
    
    if (matches) {
        return <div>
            {matches.map(match => <div key={match.id} className={Styles.match}>
                <span>{match.term} {match.translation && `(${t(PartOfSpeechTranslationString(match.partOfSpeech))})`} = </span>
                <span>{match.translation || "?"}</span>
                {match.translation ? null : 
                <span className={Styles.suggestAddButton}>
                    <SmallButton>{t("add to glossary")}</SmallButton>
                </span>}
            </div>)}
        </div>
    } else {
        return null;
    }
}
