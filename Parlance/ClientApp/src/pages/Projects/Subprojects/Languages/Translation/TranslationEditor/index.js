import Styles from "./index.module.css";
import {useParams} from "react-router-dom";
import EntryList from "./EntryList";
import TranslationArea from "./TranslationArea";
import ExtrasArea from "./ExtrasArea";
import {useEffect, useState} from "react";
import Fetch from "../../../../../../helpers/Fetch";
import {useUpdateManager} from "./UpdateManager";
import i18n from "../../../../../../helpers/i18n";
import Modal from "../../../../../../components/Modal";
import {useTranslation} from "react-i18next";
import {useHotkeys} from "react-hotkeys-hook";
import useTranslationEntries from "./EntryUtils";

export default function TranslationEditor(props) {
    const {project, subproject, language, key} = useParams();
    const [entries, setEntries] = useState([]);
    const [subprojectData, setSubprojectData] = useState({});
    const [subprojectLanguageData, setSubprojectLanguageData] = useState({});
    const [ready, setReady] = useState(false);
    const {
        goToPrevUnfinished,
        goToNextUnfinished
    } = useTranslationEntries(entries);
    const {t} = useTranslation();

    useHotkeys("ctrl+enter", goToNextUnfinished, {
        enableOnTags: ["INPUT", "TEXTAREA", "SELECT"],
        enableOnContentEditable: true
    });
    useHotkeys("ctrl+up", goToPrevUnfinished);
    useHotkeys("ctrl+down", goToNextUnfinished);

    const updateManager = useUpdateManager();
    updateManager.on("outOfDate", () => {
        Modal.mount(<Modal heading={t("TRANSLATION_OUT_OF_DATE")} buttons={[
            {
                text: t("RELOAD"),
                onClick: () => document.location.reload()
            }
        ]}>
            {t("TRANSLATION_OUT_OF_DATE_PROMPT")}
        </Modal>)
    });
    updateManager.on("error", () => {
        Modal.mount(<Modal heading={t("TRANSLATION_SUBMIT_ERROR")} buttons={[
            {
                text: t("Reload"),
                onClick: () => document.location.reload()
            }
        ]}>
            {t("TRANSLATION_SUBMIT_ERROR_PROMPT")}
        </Modal>)
    })

    const translationDirection = (new Intl.Locale(language)).textInfo?.direction || "ltr";

    const updateEntries = async () => {
        setEntries(await Fetch.get(`/api/Projects/${project}/${subproject}/${language}/entries`, result => {
            updateManager.setEtag(result.headers.get("etag"));
        }));
    }

    const updateSubproject = async () => {
        setSubprojectData(await Fetch.get(`/api/Projects/${project}/${subproject}`));
    }

    const updateSubprojectLanguage = async () => {
        setSubprojectLanguageData(await Fetch.get(`/api/Projects/${project}/${subproject}/${language}`));
    }

    const canEdit = subprojectLanguageData?.canEdit;

    useEffect(() => {
        (async () => {
            await Promise.all([
                updateEntries(),
                updateSubproject(),
                updateSubprojectLanguage(),
                i18n.pluralPatterns(language)
            ])
            setReady(true);
        })();
    }, []);

    const pushUpdate = async (key, update) => {
        if (!canEdit) return;

        setEntries(entries => entries.map(entry => {
            if (entry.key !== key) {
                return entry;
            }

            entry.translation = update.translationStrings;
            return entry;
        }));

        updateManager.queueForUpdate(key, update);
    };

    if (ready) {
        return <div className={Styles.root}>
            <EntryList entries={entries} translationDirection={translationDirection} updateManager={updateManager}
                       translationFileType={subprojectData.translationFileType}/>
            <TranslationArea onPushUpdate={pushUpdate} entries={entries} translationDirection={translationDirection}
                             translationFileType={subprojectData.translationFileType} canEdit={canEdit}/>
            <ExtrasArea/>
        </div>
    } else {
        return <div className={Styles.root}>
            Hang on...
        </div>
    }
}