import React, {useReducer, useContext} from "react";
import {CSSTransition, TransitionGroup} from "react-transition-group";
import AccountSettings from "./AccountSettings";
import {Route, Routes, useLocation} from "react-router-dom";
import {useTranslation} from "react-i18next";
import UserManager from "../../helpers/UserManager";
import Container from "../../components/Container";
import PageHeading from "../../components/PageHeading";
import UsernameChange from "./UsernameChange";
import EmailChange from "./EmailChange";
import PasswordChange from "./PasswordChange";
import VerifyEmail from "./VerifyEmail";

import "./index.css";
import Otp from "./Otp";
import SecurityKeys from "./SecurityKeys.js";
import Attribution from "./Attribution";
import {NotificationsSettings} from "@/pages/Account/Notifications/index";
import {ServerInformationContext} from "@/context/ServerInformationContext";

export default function Account() {
    const [ignored, forceUpdate] = useReducer(x => x + 1, 0);
    const location = useLocation();
    const {t} = useTranslation();
    const serverInformation = useContext(ServerInformationContext);

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
                    <PageHeading level={2}>{t("ACCOUNT_SETTINGS_SUBTITLE", {account: serverInformation.accountName})}</PageHeading>
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
                <PageHeading level={2}>{t("ACCOUNT_SETTINGS_SUBTITLE", {account: serverInformation.accountName})}</PageHeading>
            </div>
        </Container>
        <TransitionGroup component={"div"}>
            <CSSTransition
                key={location.pathname.split("/")[2]}
                timeout={250}
                classNames={"account-settings-lift"}>
                <Routes location={location}>
                    <Route element={<AccountSettings/>} path={"/"}/>
                    <Route element={<UsernameChange/>} path={"/username"}/>
                    <Route element={<EmailChange/>} path={"/email"}/>
                    <Route element={<PasswordChange/>} path={"/password"}/>
                    <Route element={<VerifyEmail/>} path={"/verify"}/>
                    <Route element={<SecurityKeys/>} path={"/keys"}/>
                    <Route element={<Otp/>} path={"/otp"}/>
                    <Route element={<Attribution/>} path={"/attribution"}/>
                    <Route element={<NotificationsSettings/>} path={"/notifications/*"}/>
                </Routes>
            </CSSTransition>
        </TransitionGroup>
    </div>
}