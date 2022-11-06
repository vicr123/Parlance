import Styles from "./Footer.module.css";
import i18n from "../helpers/i18n";
import {useMatch} from "react-router-dom";
import Button from "./Button";
import {useTranslation} from "react-i18next";
import LanguageSelectionModal from "./modals/LanguageSelectionModal";
import Modal from "./Modal";

export default function Footer() {
    const {t} = useTranslation();
    const match = useMatch("/projects/:project/:subproject/:language/translate");

    const changeLanguage = () => {
        Modal.mount(<LanguageSelectionModal/>)
    };

    return <div className={`${Styles.footerContainer} ${match && Styles.hiddenFooter}`}>
        <div className={Styles.footer}>
            <div className={Styles.footerButtonContainer}>
                <Button
                    onClick={() => window.open("https://www.github.com/vicr123/Parlance", "_blank")}>{t("PARLANCE_ON_GIT")}</Button>
            </div>
            <div className={Styles.footerButtonContainer}>
                <Button onClick={changeLanguage}>{i18n.humanReadableLocale(i18n.resolvedLanguage)}</Button>
            </div>
        </div>
    </div>
}