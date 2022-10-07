import React from 'react';
import PageContainer from "../components/PageContainer";
import Container from "../components/Container";
import {useTranslation} from "react-i18next";
import SelectableList from "../components/SelectableList";
import {useNavigate} from "react-router-dom";
import PageHeading from "../components/PageHeading";
import {VerticalSpacer} from "../components/Layouts";

export function Home() {
    const navigate = useNavigate();
    const {t} = useTranslation();

    return (
        <PageContainer>
            <Container>
                {t("Welcome to Parlance!")}
            </Container>
            <VerticalSpacer/>
            <Container>
                <PageHeading level={3}>{t("ACTIONS")}</PageHeading>
                <SelectableList onClick={() => navigate("projects")}>{t("PROJECTS")}</SelectableList>
            </Container>
        </PageContainer>
    );
}

Home.displayName = Home.name
