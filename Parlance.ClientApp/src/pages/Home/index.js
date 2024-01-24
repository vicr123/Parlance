import React from 'react';
import {useTranslation} from "react-i18next";
import {useNavigate} from "react-router-dom";
import SmallButton from "../../components/SmallButton";
import Styles from "./index.module.css";

function Promo({children}) {
    return <div className={Styles.promoContainer}>
        <div className={Styles.promo}>
            {children}
        </div>
    </div>
}

export function Home() {
    const navigate = useNavigate();
    const {t} = useTranslation();

    return (
        <div>
            <Promo>
                <div>
                    <div
                        className={Styles.promoHeader}>{t("HOME_HERO_TITLE", {serverName: "Victor Tran apps"})}</div>
                    <div
                        className={Styles.promoSub}>{t("HOME_HERO_SUBTITLE", {serverName: "Victor Tran apps"})}</div>
                </div>
                <div className={Styles.buttonList}>
                    <SmallButton onClick={() => navigate("projects")}>{t("PROJECTS")}</SmallButton>
                </div>
            </Promo>
        </div>
    );
}

Home.displayName = Home.name
