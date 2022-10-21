import Styles from "./TranslationArea.module.css"
import {useParams} from "react-router-dom";
import {useTranslation} from "react-i18next";
import i18n from "../../../../../../helpers/i18n";
import {Fragment, useEffect, useState} from "react";
import {checkTranslation} from "../../../../../../checks";
import {VerticalLayout} from "../../../../../../components/Layouts";
import {TranslationSlateEditor} from "./TranslationSlateEditor";
import Button from "../../../../../../components/Button";
import useTranslationEntries from "./EntryUtils";

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

    return <div className={Styles.translationContainer}>
        <div className={Styles.translationPart}>
            <div className={Styles.translationPartIndicator}>{headings.map((item, index) => {
                if (index === 0) {
                    return <span key={index}>{item}</span>
                } else {
                    return <Fragment key={index}>
                        <span>&nbsp;&#8226;&nbsp;</span>
                        <span className={Styles.translationPartIndicatorExtras}>{item}</span>
                    </Fragment>
                }
            })}</div>
            <TranslationSlateEditor value={translationContent} translationFileType={translationFileType}
                                    translationDirection={translationDirection} readOnly={!canEdit}
                                    onTranslationUpdate={onTranslationUpdate} onChange={textChange}
                                    pluralExample={pluralExample?.number !== undefined ? i18n.number(language, pluralExample.number) : null}
            />
        </div>
        <div className={Styles.checksContainer}>
            {checkState.map((check, idx) => {
                let classes = [Styles.checkItem];
                if (check.checkSeverity === "warn") classes.push(Styles.checkWarn);
                if (check.checkSeverity === "error") classes.push(Styles.checkError);

                return <div className={classes.join(" ")} key={idx}>
                    <div>{check.message}</div>
                </div>
            })}
        </div>
    </div>
}

export default function TranslationArea({entries, translationDirection, translationFileType, onPushUpdate, canEdit}) {
    const {key} = useParams();
    const {t} = useTranslation();
    const {
        entry,
        nextUnfinished,
        prevUnfinished,
        goToPrevUnfinished,
        goToNextUnfinished
    } = useTranslationEntries(entries);


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
        <div className={Styles.translationAreaInner}>
            {statusAlerts}
            <div className={Styles.sourceTranslationContainer}>
                <div
                    className={Styles.sourceTranslationIndicator}>{t("TRANSLATION_AREA_SOURCE_TRANSLATION_TITLE")}</div>
                <TranslationSlateEditor value={entry.source} diffWith={entry.oldSourceString}
                                        translationFileType={translationFileType}
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

                return <TranslationPart onTranslationUpdate={translationUpdate} entry={pform} key={idx}
                                        sourceTranslation={entry.source} translationFileType={translationFileType}
                                        translationDirection={translationDirection} canEdit={canEdit}/>
            })}
            <div className={Styles.controls}>
                <div className={Styles.controlArea}>
                    <Button onClick={goToPrevUnfinished} disabled={!prevUnfinished}>
                        <div className={Styles.navButtonContents}>
                            <span>{t("TRANSLATION_AREA_PREVIOUS_UNFINISHED")}</span>
                            <span className={Styles.navButtonSource}>{prevUnfinished?.source}</span>
                        </div>
                    </Button>
                </div>
                <div className={Styles.controlArea}>
                    <Button onClick={goToNextUnfinished} disabled={!nextUnfinished}>
                        <div className={Styles.navButtonContents}>
                            <span>{t("TRANSLATION_AREA_NEXT_UNFINISHED")}</span>
                            <span className={Styles.navButtonSource}>{nextUnfinished?.source}</span>
                        </div>
                    </Button>
                </div>
            </div>
        </div>
    </div>
}