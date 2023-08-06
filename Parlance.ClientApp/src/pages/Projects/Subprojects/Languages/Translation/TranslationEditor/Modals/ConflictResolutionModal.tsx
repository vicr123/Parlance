import Modal from "../../../../../../../components/Modal";
import {useTranslation} from "react-i18next";
import {VerticalLayout} from "../../../../../../../components/Layouts";
import {TranslationWithPluralType} from "../../../../../../../interfaces/translation";
import {UpdateManager} from "../UpdateManager";
import PageHeading from "../../../../../../../components/PageHeading";

interface ConflictResolutionModalProps {
    incoming: TranslationWithPluralType[]
    current: TranslationWithPluralType[]
    translationKey: string
    updateManager: UpdateManager;
}

interface ConflictResolutionPartProps {
    translations: TranslationWithPluralType[]
}

function ConflictResolutionPart({translations}: ConflictResolutionPartProps) {
    return <div>
        {translations.map(x => <span>{x.translationContent}</span>)}
    </div>
}

export default function ConflictResolutionModal({incoming, current, translationKey, updateManager}: ConflictResolutionModalProps) {
    const {t} = useTranslation();
    
    return <Modal heading={t("Conflict Resolution")} buttons={[
        {
            text: t("Accept Incoming Changes"),
            onClick: () => {
                Modal.unmount();
                updateManager.clearConflict(translationKey, incoming);
            }
        },
        {
            text: t("Use My Changes"),
            onClick: () => {
                Modal.unmount();
                updateManager.clearConflict(translationKey, current);
                updateManager.queueForUpdate(translationKey, {
                    translationStrings: current
                });
            }
        }
    ]}>
        <VerticalLayout>
            <span>{t("Looks like you were editing this string at the same time as someone else. Which string do you want to keep?")}</span>
            <PageHeading level={3}>{t("Incoming Changes")}</PageHeading>
            <ConflictResolutionPart translations={incoming} />
            <PageHeading level={3}>{t("Your Changes")}</PageHeading>
            <ConflictResolutionPart translations={current} />
        </VerticalLayout>
    </Modal>
}
