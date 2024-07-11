import PageHeading from "../../../components/PageHeading";
import { useTranslation } from "react-i18next";
import ListPageBlock from "../../../components/ListPageBlock";
import { useEffect, useState } from "react";
import SelectableList, {
    SelectableListItem,
} from "../../../components/SelectableList";
import Fetch from "../../../helpers/Fetch";
import { VerticalLayout } from "@/components/Layouts";
import { useNavigate } from "react-router-dom";
import { PartialProjectResponse } from "@/interfaces/projects";

export default function () {
    const [projects, setProjects] = useState<SelectableListItem[]>([]);
    const navigate = useNavigate();
    const { t } = useTranslation();

    const updateProjects = async () => {
        let projects =
            await Fetch.get<PartialProjectResponse[]>("/api/projects");
        setProjects(
            projects.map(project => ({
                contents: project.name,
                onClick: () => navigate(project.systemName),
            })),
        );
    };

    useEffect(() => {
        updateProjects();
    }, []);

    const addProject = () => {
        navigate("add");
    };

    return (
        <>
            <ListPageBlock>
                <VerticalLayout>
                    <PageHeading level={3}>{t("PROJECTS")}</PageHeading>
                    <span>{t("PROJECT_LISTING_PROMPT")}</span>
                    <SelectableList items={projects} />
                </VerticalLayout>
            </ListPageBlock>
            <ListPageBlock>
                <VerticalLayout>
                    <SelectableList onClick={addProject}>
                        {t("ADD_PROJECT")}
                    </SelectableList>
                </VerticalLayout>
            </ListPageBlock>
        </>
    );
}
