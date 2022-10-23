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

export default function SubprojectListing() {
    const {project} = useParams();
    const [projectData, setProjectData] = useState();
    const [done, setDone] = useState(false);
    const navigate = useNavigate();
    const {t} = useTranslation();

    const updateProjects = async () => {
        setProjectData(await Fetch.get(`/api/projects/${project}`));
        setDone(true);
    };

    useEffect(() => {
        updateProjects();
    }, []);

    return <div>
        <BackButton text={t("BACK_TO_PROJECTS")} onClick={() => navigate("../..")}/>
        <VerticalSpacer/>
        <Container>
            <PageHeading level={3}>{t("AVAILABLE_SUBPROJECTS")}</PageHeading>
            <SelectableList items={done ? projectData?.subprojects?.map(p => ({
                contents: <TranslationProgressIndicator title={i18n.humanReadableLocale(p.name)}
                                                        data={p.completionData}/>,
                onClick: () => navigate(p.systemName)
            })) : TranslationProgressIndicator.PreloadContents()}/>
        </Container>
        <VerticalSpacer/>
        <Container>
            <PageHeading level={3}>{t("ACTIONS")}</PageHeading>
            <SelectableList items={done ? [{
                contents: t("MANAGE_VCS_REPOSITORY"),
                onClick: () => navigate("vcs")
            }] : SelectableList.PreloadingText(1)}/>
        </Container>
    </div>
}