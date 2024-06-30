import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import React, { useEffect, useState } from "react";
import Fetch from "../../../../../helpers/Fetch";
import i18n from "../../../../../helpers/i18n";
import Overview from "./Overview";
import ListPage from "../../../../../components/ListPage";
import Hero from "../../../../../components/Hero";
import BackButton from "../../../../../components/BackButton";
import Spinner from "../../../../../components/Spinner";
import GlossariesDashboard from "./GlossariesDashboard";
import { SubprojectLocaleMeta } from "../../../../../interfaces/projects";
import { CommentsDashboard } from "./CommentsDashboard";

export default function Dashboard() {
    const { project, subproject, language } = useParams();
    const [data, setData] = useState<SubprojectLocaleMeta>();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const updateData = async () => {
        setData(
            await Fetch.get(
                `/api/projects/${project}/${subproject}/${language}`,
            ),
        );
    };

    useEffect(() => {
        updateData();
    }, []);

    //TODO
    if (!data) return <Spinner.Container />;

    const items = [
        t("DASHBOARD"),
        {
            name: t("OVERVIEW"),
            slug: "overview",
            render: <Overview data={data} />,
            default: true,
        },
        {
            name: t("GLOSSARIES"),
            slug: "glossaries",
            render: <GlossariesDashboard />,
        },
        {
            name: t("COMMENTS"),
            slug: "comments",
            render: <CommentsDashboard />,
        },
    ];

    return (
        <div style={{ display: "flex", flexDirection: "column", flexGrow: 1 }}>
            <BackButton
                text={t("BACK_TO_LANGUAGES")}
                onClick={() => navigate("../..")}
            />
            <Hero
                heading={i18n.humanReadableLocale(language!)}
                subheading={data.subprojectName}
                buttons={[
                    {
                        text: t("TRANSLATE"),
                        onClick: () => navigate("translate"),
                    },
                ]}
            />
            <ListPage items={items} />
        </div>
    );
}
