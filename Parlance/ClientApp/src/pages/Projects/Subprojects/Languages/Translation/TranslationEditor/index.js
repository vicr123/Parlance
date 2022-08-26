import Styles from "./index.module.css";
import {useParams} from "react-router-dom";
import EntryList from "./EntryList";
import TranslationArea from "./TranslationArea";
import ExtrasArea from "./ExtrasArea";
import {useEffect, useState} from "react";
import Fetch from "../../../../../../helpers/Fetch";
import {HotKeys} from "react-hotkeys";
import {useUpdateManager} from "./UpdateManager";
import i18n from "../../../../../../helpers/i18n";
import Modal from "../../../../../../components/Modal";
import {useTranslation} from "react-i18next";

export default function(props) {
    const {project, subproject, language, key} = useParams();
    const [entries, setEntries] = useState([]);
    const [subprojectData, setSubprojectData] = useState({});
    const [ready, setReady] = useState(false);
    const {t} = useTranslation();
    
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
    
    useEffect(() => {
        (async () => {
            await Promise.all([
                updateEntries(),
                updateSubproject(),
                i18n.pluralPatterns(language)
            ])
            setReady(true);
        })();
    }, []);
    
    const pushUpdate = async (key, update) => {
        setEntries(entries => entries.map(entry => {
            if (entry.key !== key) {
                return entry;
            }
            
            entry.translation = update.translationStrings;
            return entry;
        }));
        
        updateManager.queueForUpdate(key, update);
    };
    
    const keymap = {
        NEXT: ["down", "ctrl+enter"],
        BACK: "up"
    };
    
    const handlers = {
        NEXT: () => {
            console.log("NEXT");
        },
        BACK: () => {
            console.log("BACK");
        }
    }
    
    if (ready) {
        return <HotKeys keyMap={keymap} handlers={handlers}>
            <div className={Styles.root}>
                <EntryList entries={entries} translationDirection={translationDirection} updateManager={updateManager} translationFileType={subprojectData.translationFileType} />
                <TranslationArea onPushUpdate={pushUpdate} entries={entries} translationDirection={translationDirection} translationFileType={subprojectData.translationFileType} />
                <ExtrasArea />
            </div>
        </HotKeys>
    } else {
        return <div className={Styles.root}>
            Hang on...
        </div>
    }
}