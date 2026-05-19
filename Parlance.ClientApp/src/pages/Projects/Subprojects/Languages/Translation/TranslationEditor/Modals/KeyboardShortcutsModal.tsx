import Modal from "@/components/Modal";
import { useTranslation } from "react-i18next";
import Styles from "./KeyboardShortcutsModal.module.css";
import KeyboardShortcut from "@/components/KeyboardShortcut";
import { KeyboardShortcuts } from "@/pages/Projects/Subprojects/Languages/Translation/TranslationEditor/KeyboardShortcuts";
import { Fragment } from "react";
import PageHeading from "@/components/PageHeading";

export function KeyboardShortcutsModal() {
    const { t } = useTranslation();

    const shortcuts = [
        t("HELP_NAVIGATION"),
        {
            shortcut: KeyboardShortcuts.NextUnfinished,
            action: t("TRANSLATION_AREA_NEXT_UNFINISHED"),
        },
        {
            shortcut: KeyboardShortcuts.PreviousUnfinished,
            action: t("TRANSLATION_AREA_PREVIOUS_UNFINISHED"),
        },
        {
            shortcut: KeyboardShortcuts.Next,
            action: t("TRANSLATION_AREA_NEXT"),
        },
        {
            shortcut: KeyboardShortcuts.Previous,
            action: t("TRANSLATION_AREA_PREVIOUS"),
        },
        t("HELP_TRANSLATION"),
        {
            shortcut: KeyboardShortcuts.CopySource,
            action: t("COPY_SOURCE"),
        },
        {
            shortcut: KeyboardShortcuts.SearchGlossary,
            action: t("SEARCH_GLOSSARY"),
        },
        {
            shortcut: KeyboardShortcuts.AddToGlossary,
            action: t("ADD_TO_GLOSSARY"),
        },
        t("MISCELLANEOUS"),
        {
            shortcut: KeyboardShortcuts.ShowKeyboardShortcuts,
            action: t("KEYBOARD_SHORTCUTS_HEADING"),
        },
    ];

    return (
        <Modal
            heading={t("KEYBOARD_SHORTCUTS_HEADING")}
            buttons={[Modal.OkButton]}
        >
            {t("KEYBOARD_SHORTCUTS_INTRO")}
            <div className={Styles.shortcutGrid}>
                {shortcuts.map(shortcut => {
                    if (typeof shortcut === "string") {
                        return (
                            <PageHeading
                                level={3}
                                className={Styles.shortcutGridTitle}
                            >
                                {shortcut}
                            </PageHeading>
                        );
                    } else {
                        return (
                            <Fragment>
                                <KeyboardShortcut
                                    shortcut={shortcut.shortcut}
                                />
                                <span>{shortcut.action}</span>
                            </Fragment>
                        );
                    }
                })}
            </div>
        </Modal>
    );
}
