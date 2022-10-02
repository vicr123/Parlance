import Styles from "./TranslationArea.module.css"
import {useParams} from "react-router-dom";
import {useTranslation} from "react-i18next";
import i18n from "../../../../../../helpers/i18n";
import {useEffect, useState} from "react";
import {checkTranslation} from "../../../../../../checks";
import {VerticalLayout} from "../../../../../../components/Layouts";
import {TranslationSlateEditor} from "./TranslationSlateEditor";

function TranslationPart({
                             entry,
                             translationDirection,
                             sourceTranslation,
                             translationFileType,
                             onTranslationUpdate,
                             canEdit
                         }) {
    const [translationContent, setTranslationContent] = useState(entry.translationContent);
    const [checkState, setCheckState] = useState([]);
    const [pluralExample, setPluralExample] = useState({});
    const {language} = useParams();
    const {t} = useTranslation();

    useEffect(() => setTranslationContent(entry.translationContent), [entry]);
    useEffect(() => setCheckState(checkTranslation(sourceTranslation, translationContent, translationFileType)), [sourceTranslation, translationContent, translationFileType]);
    useEffect(() => {
        (async () => {
            let patterns = await i18n.pluralPatterns(language);
            let numbers = patterns[entry.pluralType];
            if (numbers) {
                let explanation;
                if (numbers.length > 5) {
                    explanation = t("TRANSLATION_AREA_INDICATOR_PLURAL_FORM", {numbers: i18n.list(i18n.language, [...numbers.slice(0, 5).map(x => x.toString()), t("ET_CETERA")])})
                } else {
                    explanation = t("TRANSLATION_AREA_INDICATOR_PLURAL_FORM", {numbers: i18n.list(i18n.language, numbers.map(x => x.toString()))})
                }

                setPluralExample({
                    explanation: explanation,
                    number: numbers[Math.floor(Math.random() * numbers.length)]
                });
            } else {
                setPluralExample({});
            }
        })();
    }, [sourceTranslation, language, entry.pluralType]);

    const textChange = (text) => {
        setTranslationContent(text);
    }

    let headings = [t("TRANSLATION_AREA_TITLE", {lang: i18n.humanReadableLocale(language)})]
    if (pluralExample?.explanation) headings.push(pluralExample.explanation);

    let translationPreview = <p
        className={Styles.translationPreview}>{translationContent.replace("%n", pluralExample?.number !== undefined ? i18n.number(language, pluralExample.number) : "%n")}</p>

    return <div className={Styles.translationContainer}>
        <div className={Styles.translationPart}>
            <div className={Styles.translationPartIndicator}>{headings.map((item, index) => {
                if (index === 0) {
                    return <span>{item}</span>
                } else {
                    return <>
                        <span>&nbsp;&#8226;&nbsp;</span>
                        <span className={Styles.translationPartIndicatorExtras}>{item}</span>
                    </>
                }
            })}</div>
            <TranslationSlateEditor value={translationContent} translationFileType={translationFileType}
                                    translationDirection={translationDirection} readOnly={false}
                                    onTranslationUpdate={onTranslationUpdate} onChange={textChange}
                                    pluralExample={pluralExample?.number !== undefined ? i18n.number(language, pluralExample.number) : null}/>
            {/*<textarea onBlur={() => onTranslationUpdate(translationContent)} dir={translationDirection}*/}
            {/*          className={`${Styles.translationPartEditor} ${Styles.translationPartEditorTextarea}`}*/}
            {/*          onChange={textChange} value={translationContent} readOnly={!canEdit}></textarea>*/}
            {/*<pre dir={translationDirection} className={Styles.translationPartEditor}>*/}
            {/*    <span>{translationContent}</span>*/}
            {/*    {translationPreview}*/}
            {/*</pre>*/}
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

export default function TranslationArea({entries, translationDirection, translationFileType, onPushUpdate, canEdit}) {
    const {language, key} = useParams();
    const {t} = useTranslation();

    const entry = entries.find(entry => entry.key === key);

    if (!entry) {
        return <div>Not Found!!!</div>
    }

    let statusAlerts = [];
    if (!canEdit) {
        statusAlerts.push(<div className={Styles.statusAlert} key={"readonlyAlert"}>
            <VerticalLayout>
                <b>{t("HEADS_UP")}</b>
                <span>{t("READ_ONLY_TRANSLATION_EXPLANATION")}</span>
            </VerticalLayout>
        </div>);
    }

    return <div className={Styles.translationArea}>
        {statusAlerts}
        <div className={Styles.sourceTranslationContainer}>
            <div className={Styles.sourceTranslationIndicator}>{t("TRANSLATION_AREA_SOURCE_TRANSLATION_TITLE")}</div>
            {/*<div className={Styles.sourceTranslation}>{entry.source}</div>*/}
            <TranslationSlateEditor value={entry.source} translationFileType={translationFileType}
                                    translationDirection={translationDirection} readOnly={true} onChange={() => {
            }}/>
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

            return <TranslationPart onTranslationUpdate={translationUpdate} entry={pform}
                                    sourceTranslation={entry.source} translationFileType={translationFileType}
                                    translationDirection={translationDirection} canEdit={canEdit}/>
        })}
    </div>
}