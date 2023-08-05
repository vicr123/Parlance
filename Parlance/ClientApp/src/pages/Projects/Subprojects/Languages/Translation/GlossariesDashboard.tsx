import Spinner from "../../../../../components/Spinner";
import {Glossary} from "../../../../../interfaces/glossary";
import React, {useEffect, useState} from "react";
import Fetch from "../../../../../helpers/Fetch";
import {useNavigate, useParams} from "react-router-dom";
import {VerticalLayout} from "../../../../../components/Layouts";
import PageHeading from "../../../../../components/PageHeading";
import {useTranslation} from "react-i18next";
import ListPageBlock from "../../../../../components/ListPageBlock";
import SelectableList from "../../../../../components/SelectableList";

export default function GlossariesDashboard() {
    const {t} = useTranslation();
    const {project, language} = useParams();
    const [glossaries, setGlossaries] = useState<Glossary[]>([]);
    const [done, setDone] = useState<boolean>(false);
    const navigate = useNavigate();
    
    const loadGlossaries = async () => {
        setGlossaries(await Fetch.get<Glossary[]>(`/api/projects/${project}/glossary`));
        setDone(true);
    };
    
    useEffect(() => {
        loadGlossaries();
    }, []);
    
    const glossaryClicked = (glossary: Glossary) => {
        navigate(`/glossaries/${glossary.id}/${language}`)
    }
    
    return <div>
        <ListPageBlock>
            <VerticalLayout>
                <PageHeading level={3}>{t("GLOSSARIES")}</PageHeading>
                <span>{t("GLOSSARIES_DASHBOARD_DESCRIPTION")}</span>
                <SelectableList items={done ? glossaries.map(g => ({
                    contents: g.name,
                    onClick: () => glossaryClicked(g)
                })) : SelectableList.PreloadingText()}/>
            </VerticalLayout>
        </ListPageBlock>
    </div>
}