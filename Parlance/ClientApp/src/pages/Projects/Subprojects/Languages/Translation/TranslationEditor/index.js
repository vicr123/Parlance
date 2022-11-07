import Styles from "./index.module.css";
import {useParams} from "react-router-dom";
import {lazy, Suspense, useEffect, useState} from "react";
import Fetch from "../../../../../../helpers/Fetch";
import {useUpdateManager} from "./UpdateManager";
import i18n from "../../../../../../helpers/i18n";
import Modal from "../../../../../../components/Modal";
import {useTranslation} from "react-i18next";
import useTranslationEntries from "./EntryUtils";
import Spinner from "../../../../../../components/Spinner";
import {KeyboardShortcuts, useKeyboardShortcut} from "./KeyboardShortcuts";
import {useTabIndex} from "react-tabindex";
import UserManager from "../../../../../../helpers/UserManager";

const EntryList = lazy(() => import("./EntryList"));
const TranslationArea = lazy(() => import("./TranslationArea"));
const AssistantArea = lazy(() => import("./AssistantArea"));

export default function TranslationEditor() {
    const {project, subproject, language, key} = useParams();
    const [entries, setEntries] = useState([]);
    const [subprojectData, setSubprojectData] = useState({});
    const [subprojectLanguageData, setSubprojectLanguageData] = useState({});
    const [searchParams, setSearchParams] = useState({
        query: "",
        filter: "all"
    });
    const [ready, setReady] = useState(false);

    const setSearchParam = (key, value) => {
        let params = {...searchParams};
        params[key] = value;
        setSearchParams(params);
    }

    const pushUpdate = async (key, update) => {
        if (!canEdit) return;

        if (!entries.some(entry => {
            if (entry.key !== key) return false;
            if (update.forceUpdate) return true;
            return JSON.stringify(entry.translation) !== JSON.stringify(update.translationStrings);
        })) return;

        setEntries(entries => entries.map(entry => {
            if (entry.key !== key) {
                return entry;
            }

            entry.translation = update.translationStrings;
            entry.oldSourceString = null;
            return entry;
        }));

        updateManager.queueForUpdate(key, update);
    };

    const {
        goToPrevUnfinished,
        goToNextUnfinished,
        goToNext,
        goToPrev
    } = useTranslationEntries(entries, searchParams, subprojectData.translationFileType, pushUpdate);
    const {t} = useTranslation();
    const tabIndex = useTabIndex(0);

    useKeyboardShortcut(KeyboardShortcuts.NextUnfinished, goToNextUnfinished);
    useKeyboardShortcut(KeyboardShortcuts.PreviousUnfinished, goToPrevUnfinished);
    useKeyboardShortcut(KeyboardShortcuts.Next, goToNext);
    useKeyboardShortcut(KeyboardShortcuts.Previous, goToPrev);

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

    const translationDirection = i18n.dir(language); //Intl textinfo not supported by Firefox //(new Intl.Locale(language)).textInfo?.direction || "ltr";

    const updateEntries = async () => {
        setEntries(await Fetch.get(`/api/Projects/${project}/${subproject}/${language}/entries`, result => {
            updateManager.setEtag(result.headers.get("X-Parlance-Hash"));
        }));
    }

    const updateSubproject = async () => {
        setSubprojectData(await Fetch.get(`/api/Projects/${project}/${subproject}`));
    }

    const updateSubprojectLanguage = async () => {
        setSubprojectLanguageData(await Fetch.get(`/api/Projects/${project}/${subproject}/${language}`));
    }

    const canEdit = subprojectLanguageData?.canEdit;

    const updateData = async () => {
        setReady(false);
        await Promise.all([
            updateEntries(),
            updateSubproject(),
            updateSubprojectLanguage(),
            i18n.pluralPatterns(language)
        ])
        setReady(true);
    }

    useEffect(() => {
        updateData();
    }, []);

    UserManager.on("currentUserChanged", updateData);

    if (ready) {
        return <Suspense fallback={<Spinner.Container/>}>
            <div className={Styles.root}>
                <EntryList searchParams={searchParams} setSearchParam={setSearchParam} entries={entries}
                           translationDirection={translationDirection} updateManager={updateManager}
                           translationFileType={subprojectData.translationFileType}/>
                <TranslationArea tabIndex={tabIndex} onPushUpdate={pushUpdate} entries={entries}
                                 translationDirection={translationDirection}
                                 translationFileType={subprojectData.translationFileType} canEdit={canEdit}
                                 searchParams={searchParams}/>
                <AssistantArea entries={entries} searchParams={searchParams}
                               translationDirection={translationDirection}/>
            </div>
        </Suspense>
    } else {
        return <Spinner.Container/>
    }
}