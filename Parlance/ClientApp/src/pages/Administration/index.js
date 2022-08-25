import React from "react";
import ListPage from "../../components/ListPage";
import {useTranslation} from "react-i18next";
import Container from "../../components/Container";
import PageHeading from "../../components/PageHeading";
import Superusers from "./Superusers";
import SSH from "./SSH";
import Projects from "./Projects";

export default function(props) {
    const {t} = useTranslation();
    
    let items = [
        t("PROJECTS"),
        {
            name: t("PROJECTS"),
            render: <Projects />
        },
        t("SSH"),
        {
            name: t("SSH_KEYS"),
            render: <SSH />
        },
        t("USERS"),
        {
            name: t("SUPERUSERS"),
            render: <Superusers />
        }
    ];
    
    return <div style={{display: "flex", flexDirection: "column", flexGrow: 1}}>
        <Container bottomBorder={true} style={{
            backgroundColor: "var(--hover-color)"
        }}>
            <div style={{
                paddingTop: "20px",
                paddingBottom: "20px"
            }}>
                <PageHeading>{t("PARLANCE_ADMINISTRATION")}</PageHeading>
                <PageHeading level={2}>{t("PARLANCE_ADMINISTRATION_DESCRIPTION")}</PageHeading>
            </div>
        </Container>
        <ListPage items={items} />
    </div>
}