import React, { useReducer, useContext, useRef } from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import AccountSettings from "./AccountSettings.js";
import { Route, Routes, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import UserManager from "../../helpers/UserManager";
import Container from "../../components/Container";
import PageHeading from "../../components/PageHeading";
import UsernameChange from "./UsernameChange.js";
import EmailChange from "./EmailChange.js";
import PasswordChange from "./PasswordChange.js";
import VerifyEmail from "./VerifyEmail.js";

import "./index.css";
import Otp from "./Otp";
import SecurityKeys from "./SecurityKeys";
import Attribution from "./Attribution.js";
import { NotificationsSettings } from "@/pages/Account/Notifications";
import { ServerInformationContext } from "@/context/ServerInformationContext";
import Hero from "@/components/Hero";

export default function Account() {
    const [, forceUpdate] = useReducer(x => x + 1, 0);
    const location = useLocation();
    const { t } = useTranslation();
    const serverInformation = useContext(ServerInformationContext);
    const transitionGroupTarget = useRef<HTMLDivElement>(null);

    UserManager.on("currentUserChanged", forceUpdate);

    if (!UserManager.isLoggedIn) {
        return (
            <div>
                <Hero
                    heading={t("ACCOUNT_SETTINGS")}
                    subheading={t("ACCOUNT_SETTINGS_SUBTITLE", {
                        account: serverInformation.accountName,
                    })}
                />
                <Container
                    style={{
                        paddingTop: "20px",
                    }}
                >
                    <PageHeading level={3}>{t("NOT_LOGGED_IN")}</PageHeading>
                    <p>{t("ACCOUNT_SETTINGS_LOGIN_PROMPT")}</p>
                </Container>
            </div>
        );
    }

    return (
        <div>
            <Hero
                heading={t("ACCOUNT_SETTINGS")}
                subheading={t("ACCOUNT_SETTINGS_SUBTITLE", {
                    account: serverInformation.accountName,
                })}
            />
            <TransitionGroup component={"div"}>
                <CSSTransition
                    key={location.pathname.split("/")[2]}
                    timeout={250}
                    classNames={"account-settings-lift"}
                    nodeRef={transitionGroupTarget}
                >
                    <div ref={transitionGroupTarget}>
                        <Routes location={location}>
                            <Route element={<AccountSettings />} path={"/"} />
                            <Route
                                element={<UsernameChange />}
                                path={"/username"}
                            />
                            <Route element={<EmailChange />} path={"/email"} />
                            <Route
                                element={<PasswordChange />}
                                path={"/password"}
                            />
                            <Route element={<VerifyEmail />} path={"/verify"} />
                            <Route element={<SecurityKeys />} path={"/keys"} />
                            <Route element={<Otp />} path={"/otp"} />
                            <Route
                                element={<Attribution />}
                                path={"/attribution"}
                            />
                            <Route
                                element={<NotificationsSettings />}
                                path={"/notifications/*"}
                            />
                        </Routes>
                    </div>
                </CSSTransition>
            </TransitionGroup>
        </div>
    );
}
