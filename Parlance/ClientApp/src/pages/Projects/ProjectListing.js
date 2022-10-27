import Container from "../../components/Container";
import PageHeading from "../../components/PageHeading";
import React, {useEffect, useState} from "react";
import Fetch from "../../helpers/Fetch";
import SelectableList from "../../components/SelectableList";
import {useNavigate} from "react-router-dom";
import i18n from "../../helpers/i18n";
import TranslationProgressIndicator from "../../components/TranslationProgressIndicator";
import {useTranslation} from "react-i18next";
import {VerticalSpacer} from "../../components/Layouts";
import ErrorCover from "../../components/ErrorCover";

export default function ProjectListing() {
    const [projects, setProjects] = useState([]);
    const [done, setDone] = useState(false);
    const [error, setError] = useState(false);
    const navigate = useNavigate();
    const {t} = useTranslation();

    const updateProjects = async () => {
        try {
            setProjects(await Fetch.get("/api/projects"));
            setDone(true);
        } catch (err) {
            console.log(err);
            setError(err);
        }
    };

    useEffect(() => {
        updateProjects();
    }, []);

    return <div>
        <VerticalSpacer/>
        <ErrorCover error={error}>
            <Container>
                <PageHeading level={3}>{t("AVAILABLE PROJECTS")}</PageHeading>
                <SelectableList items={done ? projects.map(p => ({
                    contents: <TranslationProgressIndicator title={i18n.humanReadableLocale(p.name)}
                                                            data={p.completionData}/>,
                    onClick: () => navigate(p.systemName)
                })) : TranslationProgressIndicator.PreloadContents()}/>
            </Container>
        </ErrorCover>
    </div>
}