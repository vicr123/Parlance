import React, {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import Fetch from "../../../helpers/Fetch";
import Container from "../../../components/Container";
import PageHeading from "../../../components/PageHeading";
import SelectableList from "../../../components/SelectableList";
import i18n from "../../../helpers/i18n";
import TranslationProgressIndicator from "../../../components/TranslationProgressIndicator";
import {useTranslation} from "react-i18next";
import BackButton from "../../../components/BackButton";
import {VerticalSpacer} from "../../../components/Layouts";
import ErrorCover from "../../../components/ErrorCover";

export default function SubprojectListing() {
    const {project} = useParams();
    const [projectData, setProjectData] = useState();
    const [done, setDone] = useState(false);
    const [error, setError] = useState();
    const navigate = useNavigate();
    const {t} = useTranslation();

    const updateProjects = async () => {
        try {
            setProjectData(await Fetch.get(`/api/projects/${project}`));
            setDone(true);
        } catch (err) {
            setError(err);
        }
    };

    useEffect(() => {
        updateProjects();
    }, []);

    return <div>
        <BackButton text={t("BACK_TO_PROJECTS")} onClick={() => navigate("../..")}/>
        <VerticalSpacer/>
        <ErrorCover error={error}>
            <Container>
                <PageHeading level={3}>{t("AVAILABLE_SUBPROJECTS")}</PageHeading>
                <SelectableList items={done ? projectData?.subprojects?.map(p => ({
                    contents: <TranslationProgressIndicator title={i18n.humanReadableLocale(p.name)}
                                                            data={p.completionData}/>,
                    onClick: () => navigate(p.systemName)
                })) : TranslationProgressIndicator.PreloadContents()}/>
            </Container>
            <VerticalSpacer/>
        </ErrorCover>
        <Container>
            <PageHeading level={3}>{t("ACTIONS")}</PageHeading>
            <SelectableList items={[{
                contents: t("MANAGE_VCS_REPOSITORY"),
                onClick: () => navigate("vcs")
            }]}/>
        </Container>
    </div>
}