import {VerticalSpacer} from "../../components/Layouts";
import Container from "../../components/Container";
import PageHeading from "../../components/PageHeading";
import SelectableList from "../../components/SelectableList";
import i18n from "../../helpers/i18n";
import React, {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {useTranslation} from "react-i18next";
import Hero from "../../components/Hero";
import ErrorCover from "../../components/ErrorCover";
import Fetch from "../../helpers/Fetch";
import {Glossary} from "../../interfaces/glossary";

export default function ServerGlossaryListing() {
    const navigate = useNavigate();
    const {t} = useTranslation();
    const [glossaries, setGlossaries] = useState<Glossary[]>([]);
    const [done, setDone] = useState<boolean>(false);
    const [error, setError] = useState<any>();

    const updateGlossaries = async () => {
        try {
            let glossaryData = await Fetch.get<Glossary[]>(`/api/glossarymanager`);
            setGlossaries(glossaryData);
            setDone(true);
        } catch (err) {
            setError(err);
        }
    };

    useEffect(() => {
        updateGlossaries();
    }, []);
    
    const glossaryClicked = (glossary: Glossary) => {
        navigate(glossary.id);
    }
    
    return <div>
        <Hero heading={t("AVAILABLE_GLOSSARIES")} buttons={[]}/>
        <VerticalSpacer/>
        <ErrorCover error={error}>
            <Container>
                <PageHeading level={3}>{t("GLOSSARIES")}</PageHeading>
                <SelectableList items={done ? glossaries.map(g => ({
                    contents: g.name,
                    onClick: () => glossaryClicked(g)
                })) : SelectableList.PreloadingText()}/>
            </Container>
        </ErrorCover>
    </div>
}