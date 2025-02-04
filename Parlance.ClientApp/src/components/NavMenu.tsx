import React, { useEffect, useState } from "react";
import Styles from "./NavMenu.module.css";
import Button from "./Button";
import Modal from "./Modal";
import LoginUsernameModal from "./modals/account/LoginUsernameModal";
import UserManager from "../helpers/UserManager";
import UserModal from "./modals/account/UserModal";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import ParlanceLogo from "../images/parlance.svg";
import Icon from "@/components/Icon";
import { GlobalSearch } from "@/components/search/GlobalSearch";
import useHotkeys from "@reecelucas/react-use-hotkeys";

export default function NavMenu() {
    const [currentUser, setCurrentUser] = useState<string>();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [globalSearchOpen, setGlobalSearchOpen] = useState(false);

    useHotkeys(
        navigator.userAgent.toLowerCase().includes("mac")
            ? "Meta+k"
            : "Control+k",
        () => {
            setGlobalSearchOpen(x => !x);
        },
    );

    UserManager.on("currentUserChanged", () => {
        setCurrentUser(UserManager.currentUser?.username || t("LOG_IN"));
    });
    useEffect(() => {
        setCurrentUser(UserManager.currentUser?.username || t("LOG_IN"));
    }, []);

    const manageAccount = () => {
        if (UserManager.isLoggedIn) {
            Modal.mount(<UserModal navigate={navigate} />);
        } else {
            Modal.mount(<LoginUsernameModal />);
        }
    };
    const goHome = () => {
        navigate("/");
    };

    const goProjects = () => {
        navigate("/projects");
    };

    const goLanguages = () => {
        navigate("/languages");
    };

    const goGlossaries = () => {
        navigate("/glossaries");
    };

    return (
        <header className={Styles.navbarHeader}>
            <div className={Styles.navbarWrapper}>
                <div className={Styles.navbarInner}>
                    <div className={Styles.navbarButtonContainer}>
                        <Button
                            onClick={goHome}
                            style={{
                                paddingTop: 0,
                                paddingBottom: 0,
                            }}
                        >
                            <img src={ParlanceLogo} alt={"Parlance"} />
                        </Button>
                        <Button onClick={goProjects}>{t("PROJECTS")}</Button>
                        <Button onClick={goLanguages}>{t("LANGUAGES")}</Button>
                        <Button onClick={goGlossaries}>
                            {t("GLOSSARIES")}
                        </Button>
                    </div>
                    <div className={Styles.navbarButtonContainer}>
                        <Button onClick={() => setGlobalSearchOpen(true)}>
                            <Icon icon={"edit-find"} />
                        </Button>
                        <Button onClick={manageAccount}>{currentUser}</Button>
                    </div>
                </div>
            </div>
            <GlobalSearch
                open={globalSearchOpen}
                onClose={() => setGlobalSearchOpen(false)}
            />
        </header>
    );
}
