import React, {useReducer} from "react";
import AccountSettings from "./AccountSettings";
import {Route, Routes} from "react-router-dom";
import {useTranslation} from "react-i18next";
import UserManager from "../../helpers/UserManager";
import Container from "../../components/Container";
import PageHeading from "../../components/PageHeading";
import UsernameChange from "./UsernameChange";
import EmailChange from "./EmailChange";
import PasswordChange from "./PasswordChange";
import VerifyEmail from "./VerifyEmail";

export default function(props) {
    const [ignored, forceUpdate] = useReducer(x => x + 1, 0);
    const {t} = useTranslation();

    UserManager.on("currentUserChanged", forceUpdate);

    if (!UserManager.isLoggedIn) {
        return <div>
            <Container bottomBorder={true} style={{
                backgroundColor: "var(--hover-color)"
            }}>
                <div style={{
                    paddingTop: "20px",
                    paddingBottom: "20px"
                }}>
                    <PageHeading>{t("ACCOUNT_SETTINGS")}</PageHeading>
                    <PageHeading level={2}>{t("ACCOUNT_SETTINGS_SUBTITLE")}</PageHeading>
                </div>
            </Container>
            <Container style={{
                paddingTop: "20px"
            }}>
                <PageHeading level={3}>{t("NOT_LOGGED_IN")}</PageHeading>
                <p>{t("ACCOUNT_SETTINGS_LOGIN_PROMPT")}</p>
            </Container>
        </div>
    }
    
    return <div>
        <Container bottomBorder={true} style={{
            backgroundColor: "var(--hover-color)"
        }}>
            <div style={{
                paddingTop: "20px",
                paddingBottom: "20px"
            }}>
                <PageHeading>{t("ACCOUNT_SETTINGS")}</PageHeading>
                <PageHeading level={2}>{t("ACCOUNT_SETTINGS_SUBTITLE")}</PageHeading>
            </div>
        </Container>
        <Routes>
            <Route element={<AccountSettings />} path={"/"} />
            <Route element={<UsernameChange />} path={"/username"} />
            <Route element={<EmailChange />} path={"/email"} />
            <Route element={<PasswordChange />} path={"/password"} />
            <Route element={<VerifyEmail />} path={"/verify"} />
        </Routes>
    </div>
}