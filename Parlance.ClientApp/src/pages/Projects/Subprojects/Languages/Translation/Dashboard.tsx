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
import useHotkeys from "@reecelucas/react-use-hotkeys";
import SmallButton from "@/components/SmallButton";
import Styles from "./Dashboard.module.css";
import Icon from "@/components/Icon";

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

    useHotkeys(
        navigator.userAgent.toLowerCase().includes("mac")
            ? "Meta+Enter"
            : "Control+Enter",
        () => {
            navigate("translate");
        },
    );

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
            />
            <ListPage
                items={items}
                additionalContent={
                    <SmallButton
                        className={Styles.translateButton}
                        onClick={() => navigate("translate")}
                    >
                        {t("TRANSLATE")}
                        <div style={{ flexGrow: 1 }} />
                        <Icon icon={"go-next"} />
                    </SmallButton>
                }
            />
        </div>
    );
}
