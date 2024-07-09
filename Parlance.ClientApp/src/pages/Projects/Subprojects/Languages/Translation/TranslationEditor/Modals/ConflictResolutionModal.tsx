import Modal from "../../../../../../../components/Modal";
import { useTranslation } from "react-i18next";
import { VerticalLayout } from "../../../../../../../components/Layouts";
import { TranslationWithPluralType } from "../../../../../../../interfaces/translation";
import { UpdateManager } from "../UpdateManager";
import PageHeading from "../../../../../../../components/PageHeading";

import Styles from "./ConflictResolutionModal.module.css";

interface ConflictResolutionModalProps {
    incoming: TranslationWithPluralType[];
    current: TranslationWithPluralType[];
    translationKey: string;
    updateManager: UpdateManager;
}

interface ConflictResolutionPartProps {
    translations: TranslationWithPluralType[];
}

function ConflictResolutionPart({ translations }: ConflictResolutionPartProps) {
    return (
        <div className={Styles.conflictResolutionContent}>
            {translations.map(x => (
                <span>{x.translationContent}</span>
            ))}
        </div>
    );
}

export default function ConflictResolutionModal({
    incoming,
    current,
    translationKey,
    updateManager,
}: ConflictResolutionModalProps) {
    const { t } = useTranslation();

    return (
        <Modal
            heading={t("CONFLICT_RESOLUTION")}
            buttons={[
                {
                    text: t("CONFLICT_RESOLUTION_ACCEPT_INCOMING"),
                    onClick: () => {
                        Modal.unmount();
                        updateManager.clearConflict(translationKey, incoming);
                    },
                },
                {
                    text: t("CONFLICT_RESOLUTION_ACCEPT_CURRENT"),
                    onClick: () => {
                        Modal.unmount();
                        updateManager.clearConflict(translationKey, current);
                        updateManager.queueForUpdate(translationKey, {
                            translationStrings: current,
                        });
                    },
                },
            ]}
        >
            <VerticalLayout>
                <span>{t("CONFLICT_RESOLUTION_PROMPT")}</span>
                <PageHeading level={3}>
                    {t("CONFLICT_RESOLUTION_INCOMING")}
                </PageHeading>
                <ConflictResolutionPart translations={incoming} />
                <PageHeading level={3}>
                    {t("CONFLICT_RESOLUTION_CURRENT")}
                </PageHeading>
                <ConflictResolutionPart translations={current} />
            </VerticalLayout>
        </Modal>
    );
}
