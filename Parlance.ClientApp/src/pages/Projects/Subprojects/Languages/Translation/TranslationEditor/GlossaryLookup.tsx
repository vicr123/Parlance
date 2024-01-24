import {
    Glossary,
    GlossaryItem,
    PartOfSpeech,
    PartOfSpeechTranslationString
} from "../../../../../../interfaces/glossary";
import {useEffect, useState} from "react";
import posTagger from "wink-pos-tagger"

import Styles from "./GlossaryLookup.module.css"
import SmallButton from "../../../../../../components/SmallButton";
import {useTranslation} from "react-i18next";
import Modal from "../../../../../../components/Modal";
import AddToGlossaryModal from "../../../../../../components/modals/glossary/AddToGlossaryModal";
import {useParams} from "react-router-dom";

interface GlossaryLookupProps {
    glossary: GlossaryItem[]
    sourceString: string
    connectedGlossaries: Glossary[]
    onGlossaryItemAdded: (item: GlossaryItem) => void;
    canEdit: boolean;
}

interface GlossaryResult {
    id: string
    term: string
    translation: string | null
    partOfSpeech: PartOfSpeech
}

export default function GlossaryLookup({glossary, sourceString, connectedGlossaries, onGlossaryItemAdded, canEdit}: GlossaryLookupProps) {
    const {language} = useParams();
    const {t} = useTranslation();
    const [matches, setMatches] = useState<GlossaryResult[]>([]);
    
    useEffect(() => {
        const tagger = posTagger();
        const tokens = tagger.tagSentence(sourceString)
            .filter(token => token.tag == "word")
            
            .filter(token => token.pos === "NN" || token.pos == "VB" || token.pos == "NNP" || token.pos == "VBZ" || token.pos == "NNS");
        
        let matches: GlossaryResult[] = glossary.filter(item => tokens.some(token => item.term.toLowerCase() == (token.lemma || token.normal).toLowerCase()) || new RegExp(`\\b${item.term}\\b`, "iu").exec(sourceString) !== null);
        matches.push(...tokens.filter(token => !glossary.some(x => x.term.toLowerCase() === (token.lemma || token.normal).toLowerCase()))
            .map(token => ({
                id: token.normal,
                term: token.lemma || token.normal,
                translation: null,
                partOfSpeech: PartOfSpeech.Unknown
            })
        ))
        setMatches([...new Map(matches.map(item => [item.term, item])).values()]);
    }, [glossary, sourceString])
    
    const addToGlossary = (match: GlossaryResult) => {
        Modal.mount(<AddToGlossaryModal language={language!} initialTerm={match.term} connectedGlossaries={connectedGlossaries} onGlossaryItemAdded={onGlossaryItemAdded} />);
    }
    
    const copy = async (match: GlossaryResult) => {
        await navigator.clipboard.writeText(match.translation!);
    }
    
    if (matches && connectedGlossaries.length) {
        return <div>
            {matches.map(match => <div key={match.id} className={Styles.match}>
                <span>{match.term} {match.translation && `(${t(PartOfSpeechTranslationString(match.partOfSpeech))})`} = </span>
                <span>{match.translation || "?"}</span>
                <span className={Styles.suggestAddButton}>
                {match.translation ?
                    <SmallButton onClick={() => copy(match)}>{t("COPY")}</SmallButton> :
                    (canEdit && <SmallButton onClick={() => addToGlossary(match)}>{t("ADD_TO_GLOSSARY")}</SmallButton>)
                }
                </span>
            </div>)}
        </div>
    } else {
        return null;
    }
}
