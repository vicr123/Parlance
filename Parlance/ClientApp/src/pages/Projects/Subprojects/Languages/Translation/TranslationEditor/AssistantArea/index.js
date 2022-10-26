import Styles from "./index.module.css";
import {useParams} from "react-router-dom";
import {VerticalLayout} from "../../../../../../../components/Layouts";
import PageHeading from "../../../../../../../components/PageHeading";
import {useTranslation} from "react-i18next";
import MicrosoftEngine from "./MicrosoftEngine";
import useTranslationEntries from "../EntryUtils";
import {useEffect, useState} from "react";

function SuggestedTranslation({suggestion}) {
    const {t} = useTranslation();

    let type;
    switch (suggestion.type) {
        case "microsoft":
            type = t("MICROSOFT_TERMINOLOGY_COLLECTION")
            break;
    }

    return <div className={Styles.suggestedTranslation}>
        <div className={Styles.suggestedSource}>{suggestion.source}</div>
        <div className={Styles.suggestedTranslationTranslation}>{suggestion.translation}</div>
    </div>
}

export default function AssistantArea({entries}) {
    const {project, subproject, language, key} = useParams();
    const [suggested, setSuggested] = useState([]);
    const {entry} = useTranslationEntries(entries);
    const {t} = useTranslation();

    useEffect(() => {
        setSuggested([]);

        let timeout = setTimeout(async () => {
            let msTranslations = await MicrosoftEngine.findTranslations(entry.source, language);
            setSuggested([...msTranslations]);
        }, 500);

        return () => clearTimeout(timeout);
    }, [entry])

    let suggestions = suggested.length === 0 ? <div>
        {t("SUGGESTIONS_NO_SUGGESTIONS")}
    </div> : suggested.map((result, i) => <SuggestedTranslation suggestion={result} key={i}/>)

    return <div className={Styles.assistantArea}>
        <div className={Styles.assistantAreaInner}>
            <VerticalLayout className={Styles.pane}>
                <div className={Styles.heading}>
                    <PageHeading level={3}>{t("ASSISTANT")}</PageHeading>
                    <span>{t("ASSISTANT_DESCRIPTION")}</span>
                </div>
            </VerticalLayout>
            <VerticalLayout className={`${Styles.pane} ${Styles.heading}`}>
                <PageHeading level={3}>{t("ASSISTANT_SUGGESTED_TRANSLATIONS")}</PageHeading>
                {suggestions}
            </VerticalLayout>
            <VerticalLayout className={`${Styles.pane} ${Styles.heading}`}>
                <PageHeading level={3}>{t("ASSISTANT_RESOURCES")}</PageHeading>
                <a href="https://www.microsoft.com/en-us/language"
                   target={"_blank"}>{t("MICROSOFT_TERMINOLOGY_COLLECTION")}</a>
            </VerticalLayout>
            <div className={Styles.disclaimer}>Microsoft Terminology Service API. © 2022 Microsoft Corporation. All
                rights reserved.
            </div>
        </div>
    </div>
}