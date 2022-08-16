import React from "react";
import ListPage from "../../components/ListPage";
import {useTranslation} from "react-i18next";
import Container from "../../components/Container";
import PageHeading from "../../components/PageHeading";
import Superusers from "./Superusers";

export default function(props) {
    const {t} = useTranslation();
    
    let items = [
        t("SSH"),
        {
            name: t("SSH_KEYS"),
            render: <div>
                SSH Keys
            </div>
        },
        t("USERS"),
        {
            name: t("SUPERUSERS"),
            render: <Superusers />
        }
    ];
    
    return <div>
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