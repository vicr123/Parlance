import { useTranslation } from "react-i18next";
import Modal from "../Modal";
import { VerticalLayout } from "../Layouts";
import { ReactElement, ReactNode, useEffect, useState } from "react";

interface ErrorModalProps {
    error: any;
    onContinue?: () => void;
    specialRenderings?: { [key: string]: ReactNode };
    okButtonText?: string;
}

export default function ErrorModal({
    error,
    onContinue,
    specialRenderings,
    okButtonText,
}: ErrorModalProps): ReactElement {
    const { t } = useTranslation();
    const [message, setMessage] = useState<string>(t("ERROR_GENERIC"));
    const [specialRendering, setSpecialRendering] = useState<ReactNode | null>(
        null,
    );

    useEffect(() => {
        (async () => {
            try {
                if (!error) return;

                let json = await error.json();
                let jsonError = json.error;

                if (specialRenderings && specialRenderings[jsonError]) {
                    setSpecialRendering(specialRenderings[jsonError]);
                    return;
                }

                switch (jsonError) {
                    case "UnknownUser":
                        setMessage(t("ERROR_UNKNOWN_USER"));
                        return;
                    case "PermissionAlreadyGranted":
                        setMessage(t("ERROR_PERMISSION_ALREADY_GRANTED"));
                        return;
                    case "UsernameAlreadyExists":
                        setMessage(t("ERROR_USERNAME_ALREADY_EXISTS"));
                        return;
                    case "TwoFactorIsDisabled":
                        setMessage(t("ERROR_TWO_FACTOR_IS_DISABLED"));
                        return;
                    case "TwoFactorAlreadyEnabled":
                        setMessage(t("ERROR_TWO_FACTOR_ALREADY_ENABLED"));
                        return;
                    case "TwoFactorAlreadyDisabled":
                        setMessage(t("ERROR_TWO_FACTOR_ALREADY_DISABLED"));
                        return;
                    case "TwoFactorCodeIncorrect":
                        setMessage(t("ERROR_TWO_FACTOR_INCORRECT"));
                        return;
                    case "NonFastForwardableError":
                        setMessage(t("ERROR_NON_FAST_FORWARDABLE"));
                        return;
                    case "MergeConflict":
                        setMessage(t("ERROR_MERGE_CONFLICT"));
                        return;
                    case "DirtyWorkingTree":
                        setMessage(t("ERROR_DIRTY_WORKING_TREE"));
                        return;
                    case "BadTokenRequestType":
                        setMessage(t("ERROR_BAD_TOKEN_REQUEST_TYPE"));
                        return;
                }
            } catch {}
        })();
    }, [error]);

    if (specialRendering) return <>specialRendering</>;

    return (
        <Modal
            buttons={[
                {
                    text: okButtonText || t("OK"),
                    onClick: () => {
                        if (onContinue) {
                            onContinue();
                        } else {
                            Modal.unmount();
                        }
                    },
                },
            ]}
        >
            <VerticalLayout>
                <span>{message}</span>
            </VerticalLayout>
        </Modal>
    );
}
