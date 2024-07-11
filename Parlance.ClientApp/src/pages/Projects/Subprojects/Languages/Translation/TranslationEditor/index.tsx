import Styles from "./index.module.css";
import { useParams } from "react-router-dom";
import { lazy, Suspense, useEffect, useState } from "react";
import Fetch from "../../../../../../helpers/Fetch";
import { useUpdateManager } from "./UpdateManager";
import i18n from "../../../../../../helpers/i18n";
import Modal from "../../../../../../components/Modal";
import { useTranslation } from "react-i18next";
import useTranslationEntries from "./EntryUtils";
import Spinner from "../../../../../../components/Spinner";
import { KeyboardShortcuts, useKeyboardShortcut } from "./KeyboardShortcuts";
import { useTabIndex } from "react-tabindex";
import UserManager from "../../../../../../helpers/UserManager";
import AddToGlossaryModal from "../../../../../../components/modals/glossary/AddToGlossaryModal";
import SearchGlossaryModal from "../../../../../../components/modals/glossary/SearchGlossaryModal";
import { SearchParams, TranslationUpdate } from "./EditorInterfaces";
import {
    Entry,
    SubprojectLanguageResponse,
    SubprojectResponse,
    TranslationEntry,
} from "@/interfaces/projects";
import {
    ConnectedGlossary,
    GlossaryItem,
} from "../../../../../../interfaces/glossary";
import useTranslatorSignalRConnection from "./TranslatorSignalRConnection";

const EntryList = lazy(() => import("./EntryList"));
const TranslationArea = lazy(() => import("./TranslationArea"));
const AssistantArea = lazy(() => import("./AssistantArea/index"));

export default function TranslationEditor() {
    const { project, subproject, language, key } = useParams();
    const [entries, setEntries] = useState<Entry[]>([]);
    const [subprojectData, setSubprojectData] = useState<SubprojectResponse>(
        // @ts-expect-error
        {},
    );
    const [subprojectLanguageData, setSubprojectLanguageData] =
        useState<SubprojectLanguageResponse>(
            // @ts-expect-error
            {},
        );
    const [glossaryData, setGlossaryData] = useState<GlossaryItem[]>([]);
    const [connectedGlossaries, setConnectedGlossaries] = useState<
        ConnectedGlossary[]
    >([]);
    const [searchParams, setSearchParams] = useState({
        query: "",
        filter: "all",
    });
    const [ready, setReady] = useState(false);

    const setSearchParam = (key: keyof SearchParams, value: string) => {
        let params = { ...searchParams };
        params[key] = value;
        setSearchParams(params);
    };

    const pushUpdate = async (key: string, update: TranslationUpdate) => {
        if (!canEdit) return;

        if (
            !entries.some(entry => {
                if (entry.key !== key) return false;
                if (update.forceUpdate) return true;
                return (
                    JSON.stringify(entry.translation) !==
                    JSON.stringify(update.translationStrings)
                );
            })
        )
            return;

        setEntries(entries =>
            entries.map(entry => {
                if (entry.key !== key) {
                    return entry;
                }

                entry.translation = update.translationStrings;
                entry.oldSourceString = undefined;
                return entry;
            }),
        );

        updateManager.queueForUpdate(key, update);
    };

    const { goToPrevUnfinished, goToNextUnfinished, goToNext, goToPrev } =
        useTranslationEntries(
            entries,
            searchParams,
            subprojectData.translationFileType,
            pushUpdate,
        );
    const { t } = useTranslation();
    const tabIndex = useTabIndex(0);

    useKeyboardShortcut(KeyboardShortcuts.NextUnfinished, goToNextUnfinished);
    useKeyboardShortcut(
        KeyboardShortcuts.PreviousUnfinished,
        goToPrevUnfinished,
    );
    useKeyboardShortcut(KeyboardShortcuts.Next, goToNext);
    useKeyboardShortcut(KeyboardShortcuts.Previous, goToPrev);
    useKeyboardShortcut(
        KeyboardShortcuts.AddToGlossary,
        () =>
            connectedGlossaries.length &&
            Modal.mount(
                <AddToGlossaryModal
                    language={language!}
                    connectedGlossaries={connectedGlossaries}
                    onGlossaryItemAdded={onGlossaryItemAdded}
                />,
            ),
    );
    useKeyboardShortcut(
        KeyboardShortcuts.SearchGlossary,
        () =>
            connectedGlossaries.length &&
            Modal.mount(
                <SearchGlossaryModal
                    language={language!}
                    glossaryData={glossaryData}
                />,
            ),
    );

    const updateManager = useUpdateManager();
    updateManager.on("outOfDate", () => {
        Modal.mount(
            <Modal
                heading={t("TRANSLATION_OUT_OF_DATE")}
                buttons={[
                    {
                        text: t("RELOAD"),
                        onClick: () => document.location.reload(),
                    },
                ]}
            >
                {t("TRANSLATION_OUT_OF_DATE_PROMPT")}
            </Modal>,
        );
    });
    updateManager.on("error", () => {
        Modal.mount(
            <Modal
                heading={t("TRANSLATION_SUBMIT_ERROR")}
                buttons={[
                    {
                        text: t("Reload"),
                        onClick: () => document.location.reload(),
                    },
                ]}
            >
                {t("TRANSLATION_SUBMIT_ERROR_PROMPT")}
            </Modal>,
        );
    });
    updateManager.on("conflictCleared", (key, resolution) => {
        setEntries(entries =>
            entries.map(entry => {
                if (entry.key !== key) {
                    return entry;
                }

                entry.translation = resolution;
                entry.oldSourceString = undefined;
                return entry;
            }),
        );
    });

    const translationDirection = i18n.dir(language); //Intl textinfo not supported by Firefox //(new Intl.Locale(language)).textInfo?.direction || "ltr";

    const updateEntries = async () => {
        setEntries(
            await Fetch.get(
                `/api/Projects/${project}/${subproject}/${language}/entries`,
                (result: WebFetchResponse) => {
                    updateManager.setEtag(
                        result.headers.get("X-Parlance-Hash")!,
                    );
                },
            ),
        );
    };

    const updateSubproject = async () => {
        setSubprojectData(
            await Fetch.get(`/api/Projects/${project}/${subproject}`),
        );
    };

    const updateSubprojectLanguage = async () => {
        setSubprojectLanguageData(
            await Fetch.get(
                `/api/Projects/${project}/${subproject}/${language}`,
            ),
        );
    };

    const updateGlossaries = async () => {
        setGlossaryData(
            await Fetch.get(`/api/Projects/${project}/${language}/glossary`),
        );
    };

    const updateConnectedGlossaries = async () => {
        setConnectedGlossaries(
            await Fetch.get(`/api/Projects/${project}/glossary`),
        );
    };

    const onGlossaryItemAdded = (item: GlossaryItem) => {
        setGlossaryData([...glossaryData, item]);
    };

    const signalRConnection = useTranslatorSignalRConnection((hash, data) => {
        setEntries(entries =>
            entries.map(entry => {
                if (
                    entry.key === key &&
                    JSON.stringify(data[entry.key]) !==
                        JSON.stringify(entry.translation)
                ) {
                    updateManager.setConflict(entry.key, data[entry.key]);
                    return entry;
                }
                return {
                    ...entry,
                    translation: (data[entry.key] || entry.translation) as any, // Make TS shut up
                    oldSourceString: data[entry.key]
                        ? undefined
                        : entry.oldSourceString,
                };
            }),
        );
        updateManager.setEtag(hash);
    });

    const canEdit = subprojectLanguageData?.canEdit;

    const updateData = async () => {
        setReady(false);
        await Promise.all([
            updateEntries(),
            updateSubproject(),
            updateSubprojectLanguage(),
            updateGlossaries(),
            updateConnectedGlossaries(),
            i18n.pluralPatterns(language!),
        ]);
        setReady(true);
    };

    useEffect(() => {
        updateData();
    }, []);

    UserManager.on("currentUserChanged", updateData);

    if (ready) {
        return (
            <Suspense fallback={<Spinner.Container />}>
                <div className={Styles.root}>
                    <EntryList
                        searchParams={searchParams}
                        setSearchParam={setSearchParam}
                        entries={entries}
                        translationDirection={translationDirection}
                        updateManager={updateManager}
                        translationFileType={subprojectData.translationFileType}
                        signalRConnection={signalRConnection}
                    />
                    <TranslationArea
                        tabIndex={tabIndex}
                        onPushUpdate={pushUpdate}
                        entries={entries}
                        translationDirection={translationDirection}
                        translationFileType={subprojectData.translationFileType}
                        canEdit={canEdit}
                        searchParams={searchParams}
                        glossary={glossaryData}
                        connectedGlossaries={connectedGlossaries}
                        onGlossaryItemAdded={onGlossaryItemAdded}
                    />
                    <AssistantArea
                        entries={entries}
                        searchParams={searchParams}
                        translationDirection={translationDirection}
                    />
                </div>
            </Suspense>
        );
    } else {
        return <Spinner.Container />;
    }
}
