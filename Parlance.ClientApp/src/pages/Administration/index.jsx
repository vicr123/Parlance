import React from "react";
import ListPage from "../../components/ListPage";
import { useTranslation } from "react-i18next";
import Container from "../../components/Container";
import PageHeading from "../../components/PageHeading";
import Superusers from "./Superusers";
import SSH from "./SSH";
import Projects from "./Projects";
import Locales from "./Locales";
import Glossaries from "./Glossaries";

export default function (props) {
    const { t } = useTranslation();

    const items = [
        t("PROJECTS"),
        {
            name: t("PROJECTS"),
            slug: "projects",
            render: <Projects />,
        },
        {
            name: t("GLOSSARIES"),
            slug: "glossaries",
            render: <Glossaries />,
        },
        t("SSH"),
        {
            name: t("SSH_KEYS"),
            slug: "ssh-keys",
            render: <SSH />,
        },
        t("USERS_AND_PERMISSIONS"),
        {
            name: t("SUPERUSERS"),
            slug: "superusers",
            render: <Superusers />,
        },
        {
            name: t("LOCALES"),
            slug: "locales",
            render: <Locales />,
        },
    ];

    return (
        <div style={{ display: "flex", flexDirection: "column", flexGrow: 1 }}>
            <Container
                bottomBorder={true}
                style={{
                    backgroundColor: "var(--hover-color)",
                }}
            >
                <div
                    style={{
                        paddingTop: "20px",
                        paddingBottom: "20px",
                    }}
                >
                    <PageHeading>{t("PARLANCE_ADMINISTRATION")}</PageHeading>
                    <PageHeading level={2}>
                        {t("PARLANCE_ADMINISTRATION_DESCRIPTION")}
                    </PageHeading>
                </div>
            </Container>
            <ListPage items={items} />
        </div>
    );
}
