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
import { useMediaQuery } from "@/helpers/Hooks";

export default function NavMenu() {
    const [currentUser, setCurrentUser] = useState<string>();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [globalSearchOpen, setGlobalSearchOpen] = useState(false);
    const [overlayMenuOpen, setOverlayMenuOpen] = useState(false);
    const isMobile = useMediaQuery("(max-width: 600px)");

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

    const menuItems = [
        {
            name: t("PROJECTS"),
            href: "/projects",
        },
        {
            name: t("LANGUAGES"),
            href: "/languages",
        },
        {
            name: t("GLOSSARIES"),
            href: "/glossaries",
        },
    ];

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
                    {isMobile ? (
                        <>
                            <div className={Styles.navbarButtonContainer}>
                                <Button
                                    onClick={() => setOverlayMenuOpen(true)}
                                >
                                    <Icon icon={"application-menu"} />
                                </Button>
                                <Button
                                    onClick={goHome}
                                    style={{
                                        paddingTop: 0,
                                        paddingBottom: 0,
                                    }}
                                >
                                    <img src={ParlanceLogo} alt={"Parlance"} />
                                </Button>
                            </div>
                            <div className={Styles.navbarButtonContainer}>
                                <Button
                                    onClick={() => setGlobalSearchOpen(true)}
                                >
                                    <Icon icon={"edit-find"} />
                                </Button>
                                <Button onClick={manageAccount}>
                                    {currentUser}
                                </Button>
                            </div>
                        </>
                    ) : (
                        <>
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
                                {menuItems.map(item => (
                                    <Button
                                        key={item.href}
                                        onClick={() => navigate(item.href)}
                                    >
                                        {item.name}
                                    </Button>
                                ))}
                            </div>
                            <div className={Styles.navbarButtonContainer}>
                                <Button
                                    onClick={() => setGlobalSearchOpen(true)}
                                >
                                    <Icon icon={"edit-find"} />
                                </Button>
                                <Button onClick={manageAccount}>
                                    {currentUser}
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </div>
            <GlobalSearch
                open={globalSearchOpen}
                onClose={() => setGlobalSearchOpen(false)}
            />
            <OverlayMenu
                menuItems={menuItems}
                open={overlayMenuOpen}
                onClose={() => setOverlayMenuOpen(false)}
            />
        </header>
    );
}

function OverlayMenu({
    menuItems,
    open,
    onClose,
}: {
    menuItems: { name: string; href: string }[];
    open: boolean;
    onClose: () => void;
}) {
    const navigate = useNavigate();

    if (!open) return null;

    return (
        <div className={Styles.overlayMenu}>
            <div className={Styles.overlayMenuTitle}>
                <Button onClick={() => onClose()}>
                    <Icon icon={"application-menu"} />
                </Button>
                <Button
                    onClick={() => {
                        navigate("/");
                        onClose();
                    }}
                    style={{
                        paddingTop: 0,
                        paddingBottom: 0,
                    }}
                >
                    <img
                        src={ParlanceLogo}
                        alt={"Parlance"}
                        style={{ marginRight: "8px" }}
                    />
                    Parlance
                </Button>
            </div>
            {menuItems.map(item => (
                <Button
                    key={item.href}
                    onClick={() => {
                        navigate(item.href);
                        onClose();
                    }}
                    style={{ justifyContent: "flex-start" }}
                >
                    {item.name}
                </Button>
            ))}
        </div>
    );
}
