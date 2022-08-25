import Styles from "./TranslationArea.module.css"
import {useParams} from "react-router-dom";
import {useTranslation} from "react-i18next";
import i18n from "../../../../../../helpers/i18n";
import {useEffect, useState} from "react";
import {checkTranslation} from "../../../../../../checks";

function TranslationPart({entry, translationDirection, sourceTranslation, translationFileType, onTranslationUpdate}) {
    const [translationContent, setTranslationContent] = useState(entry.translationContent);
    const [checkState, setCheckState] = useState([]);
    const [pluralExample, setPluralExample] = useState(0);
    const {language} = useParams();
    const {t} = useTranslation();
    
    useEffect(() => setTranslationContent(entry.translationContent), [entry]);
    useEffect(() => setCheckState(checkTranslation(sourceTranslation, translationContent, translationFileType)), [sourceTranslation, translationContent, translationFileType]);
    useEffect(() => {
        let patterns = i18n.pluralPatterns(language);
        let numbers = patterns[entry.pluralType];
        if (numbers) {
            setPluralExample(numbers[Math.floor(Math.random() * numbers.length)]);
        }
    }, [sourceTranslation, language, entry.pluralType]);
    
    const textChange = (e) => {
        setTranslationContent(e.target.value);
    }
    
    let translationPreview = <p className={Styles.translationPreview}>{translationContent.replace("%n", i18n.number(language, pluralExample))}</p>
    
    return <div className={Styles.translationContainer}>
        <div className={Styles.translationPart}>
            <div className={Styles.translationPartIndicator}>{t("TRANSLATION_AREA_TITLE", {lang: i18n.humanReadableLocale(language)})}</div>
            <textarea onBlur={() => onTranslationUpdate(translationContent)} dir={translationDirection} className={`${Styles.translationPartEditor} ${Styles.translationPartEditorTextarea}`} onChange={textChange} value={translationContent}></textarea>
            <pre dir={translationDirection} className={Styles.translationPartEditor}>
                <span>{translationContent}</span>
                {translationPreview}
            </pre>
        </div>
        <div className={Styles.checksContainer}>
            {checkState.map(check => {
                let classes = [Styles.checkItem];
                if (check.checkSeverity === "warn") classes.push(Styles.checkWarn);
                if (check.checkSeverity === "error") classes.push(Styles.checkError);

                return <div className={classes.join(" ")}>
                    <div>{check.message}</div>
                </div>
            })}
        </div>
    </div>
}

export default function({entries, translationDirection, translationFileType, onPushUpdate}) {
    const {language, key} = useParams();
    const {t} = useTranslation();
    
    const entry = entries.find(entry => entry.key === key);
    
    if (!entry) {
        return <div>Not Found!!!</div>
    }
    
    return <div className={Styles.translationArea}>
        <div className={Styles.sourceTranslationContainer}>
            <div className={Styles.sourceTranslationIndicator}>{t("TRANSLATION_AREA_SOURCE_TRANSLATION_TITLE")}</div>
            <div className={Styles.sourceTranslation}>{entry.source}</div>
        </div>
        {entry.translation.map((pform, idx) => {
            const translationUpdate = (contents) => {
                onPushUpdate(key, {
                    translationStrings: entry.translation.map((pform2, idx2) => {
                        if (idx === idx2) {
                            return {
                                pluralType: pform2.pluralType,
                                translationContent: contents
                            }
                        } else {
                            return {
                                pluralType: pform2.pluralType,
                                translationContent: pform2.translationContent
                            }
                        }
                    })
                });
            };
            
            return <TranslationPart onTranslationUpdate={translationUpdate} entry={pform} sourceTranslation={entry.source} translationFileType={translationFileType} translationDirection={translationDirection}/>
        })}
    </div>
}