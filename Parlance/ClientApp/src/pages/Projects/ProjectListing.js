import Container from "../../components/Container";
import PageHeading from "../../components/PageHeading";
import React, {useEffect, useState} from "react";
import Fetch from "../../helpers/Fetch";
import SelectableList from "../../components/SelectableList";
import {useNavigate} from "react-router-dom";
import TranslationProgressIndicator from "../../components/TranslationProgressIndicator";
import {useTranslation} from "react-i18next";
import {VerticalSpacer} from "../../components/Layouts";
import ErrorCover from "../../components/ErrorCover";
import {calculateDeadline} from "../../helpers/Misc";

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
                <PageHeading level={3}>{t("ACTIONS")}</PageHeading>
                <SelectableList items={[
                    {
                        contents: t("translation:AVAILABLE_LANGUAGES"),
                        onClick: () => navigate("languages")
                    }
                ]}/>
                <VerticalSpacer/>
                <PageHeading level={3}>{t("AVAILABLE_PROJECTS")}</PageHeading>
                <SelectableList
                    items={done ? projects.sort((a, b) => calculateDeadline(a.deadline).ms - calculateDeadline(b.deadline).ms).map(p => ({
                        contents: <TranslationProgressIndicator title={p.name}
                                                                data={p.completionData} deadline={p.deadline}/>,
                        onClick: () => navigate(p.systemName)
                    })) : TranslationProgressIndicator.PreloadContents()}/>
            </Container>
        </ErrorCover>
    </div>
}