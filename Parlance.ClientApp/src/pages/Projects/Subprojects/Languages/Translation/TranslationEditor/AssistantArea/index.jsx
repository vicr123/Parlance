import Styles from "./index.module.css";
import { useParams } from "react-router-dom";
import { VerticalLayout } from "@/components/Layouts";
import PageHeading from "../../../../../../../components/PageHeading";
import { useTranslation } from "react-i18next";
import useTranslationEntries from "../EntryUtils";
import { useEffect, useState } from "react";
import SmallButton from "../../../../../../../components/SmallButton";
import PreloadingBlock from "../../../../../../../components/PreloadingBlock";
import { Box } from "../Box";

function SuggestedTranslation({ suggestion, index, translationDirection }) {
    const { t } = useTranslation();

    let type;
    switch (suggestion?.type) {
        default:
            break;
    }

    return (
        <div
            className={`${Styles.suggestedTranslation} ${Styles.suggestedLoading}`}
            style={{
                zIndex: 500 - (index || 0),
            }}
        >
            <div className={Styles.suggestedBorder} />
            <div className={Styles.suggestedSource} dir={"ltr"}>
                {suggestion?.source || (
                    <PreloadingBlock width={30}>text</PreloadingBlock>
                )}
            </div>
            <div
                className={Styles.suggestedTranslationTranslation}
                dir={translationDirection}
            >
                {suggestion?.translation || (
                    <PreloadingBlock>text</PreloadingBlock>
                )}
            </div>
            <div className={Styles.suggestedControlsContainer}>
                <div className={Styles.suggestedBorder} />
                <div className={Styles.suggestedControls}>
                    <SmallButton>{t("Copy to Translation")}</SmallButton>
                </div>
            </div>
        </div>
    );
}

export default function AssistantArea({
    entries,
    searchParams,
    translationDirection,
}) {
    const { project, subproject, language, key } = useParams();
    const [suggested, setSuggested] = useState([]);
    const [loading, setLoading] = useState(false);
    const { entry } = useTranslationEntries(entries, searchParams);
    const { t } = useTranslation();

    useEffect(() => {
        setSuggested([]);
        setLoading(true);

        let timeout = setTimeout(async () => {
            try {
                setSuggested([]);
                setLoading(false);
            } catch {
                setLoading(false);
            }
        }, 500);

        return () => clearTimeout(timeout);
    }, [entry]);

    let suggestions = loading ? (
        <>
            <SuggestedTranslation />
            <SuggestedTranslation />
            <SuggestedTranslation />
            <SuggestedTranslation />
            <SuggestedTranslation />
        </>
    ) : suggested.length === 0 ? (
        <div>{t("SUGGESTIONS_NO_SUGGESTIONS")}</div>
    ) : (
        suggested.map((result, i) => (
            <SuggestedTranslation
                index={i}
                suggestion={result}
                key={i}
                translationDirection={translationDirection}
            />
        ))
    );

    return (
        <div className={Styles.assistantArea}>
            <div className={Styles.assistantAreaInner}>
                <Box>
                    <VerticalLayout className={Styles.pane}>
                        <div className={Styles.heading}>
                            <PageHeading level={3}>
                                {t("ASSISTANT")}
                            </PageHeading>
                            <span>{t("ASSISTANT_DESCRIPTION")}</span>
                        </div>
                    </VerticalLayout>
                </Box>
                <Box>
                    <VerticalLayout
                        className={`${Styles.pane} ${Styles.heading}`}
                    >
                        <PageHeading level={3}>
                            {t("ASSISTANT_SUGGESTED_TRANSLATIONS")}
                        </PageHeading>
                        <div className={Styles.suggestionsContainer}>
                            {suggestions}
                        </div>
                    </VerticalLayout>
                </Box>
                {/*<VerticalLayout className={`${Styles.pane} ${Styles.heading}`}>*/}
                {/*    <PageHeading level={3}>{t("ASSISTANT_RESOURCES")}</PageHeading>*/}
                {/*</VerticalLayout>*/}
            </div>
        </div>
    );
}
