import {GlossaryItem} from "../../../../../../interfaces/glossary";
import {useEffect, useState} from "react";

import Styles from "./GlossaryLookup.module.css"

interface GlossaryLookupProps {
    glossary: GlossaryItem[]
    sourceString: string
}

export default function GlossaryLookup({glossary, sourceString}: GlossaryLookupProps) {
    const [matches, setMatches] = useState<GlossaryItem[]>([]);
    
    useEffect(() => {
        setMatches(glossary.filter(item => new RegExp(`\\b${item.term}\\b`).exec(sourceString) !== null));
    }, [glossary, sourceString])
    
    if (matches) {
        return <div>
            {matches.map(match => <div key={match.id} className={Styles.match}>
                <span>{match.term} = {match.translation}</span>
            </div>)}
        </div>
    } else {
        return null;
    }
}