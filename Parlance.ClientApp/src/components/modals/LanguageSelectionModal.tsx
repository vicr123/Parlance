import { useTranslation } from "react-i18next";
import Modal from "../Modal";
import { useEffect, useState } from "react";
import Spinner from "../Spinner";
import Fetch from "../../helpers/Fetch";
import ModalList from "../ModalList";
import i18n from "../../helpers/i18n";
import LoadingModal from "./LoadingModal";

export default function LanguageSelectionModal() {
    const [done, setDone] = useState(false);
    const [languageIndex, setLanguageIndex] = useState([]);
    const { t } = useTranslation();

    useEffect(() => {
        (async () => {
            setLanguageIndex(
                await Fetch.get("/resources/translations/index.json"),
            );
            setDone(true);
        })();
    }, []);

    const setLang = async (lang: string) => {
        Modal.mount(<LoadingModal />);
        if (lang === "system") {
            localStorage.removeItem("lang");
            await i18n.changeLanguage();
        } else {
            localStorage.setItem("lang", lang);
            await i18n.changeLanguage(lang);
        }

        Modal.unmount();
    };

    return (
        <Modal heading={t("SELECT_LANGUAGE")} buttons={[Modal.CancelButton]}>
            <span>{t("SELECT_LANGUAGE_PROMPT")}</span>
            {done ? (
                <ModalList>
                    {["system", ...languageIndex].map(x => {
                        return {
                            text:
                                x === "system"
                                    ? t("SELECT_LANGUAGE_BROWSER_SETTINGS")
                                    : i18n.humanReadableLocale(x, x),
                            onClick: () => setLang(x),
                            dir: i18n.dir(x),
                        };
                    })}
                </ModalList>
            ) : (
                <Spinner.Container />
            )}
        </Modal>
    );
}
