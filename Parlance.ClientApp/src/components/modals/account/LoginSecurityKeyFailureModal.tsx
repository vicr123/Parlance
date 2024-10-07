import { useTranslation } from "react-i18next";
import Modal from "../../Modal";
import UserManager from "@/helpers/UserManager";
import { LoginPasswordModal } from "./LoginPasswordModal";
import { TokenAcquisitionSession } from "@/helpers/TokenAcquisitionSession";

export function LoginSecurityKeyFailureModal({
    acquisitionSession,
}: {
    acquisitionSession: TokenAcquisitionSession;
}) {
    const { t } = useTranslation();

    return (
        <Modal
            buttons={[
                {
                    text: t("SECURITY_KEY_USE_PASSWORD_INSTEAD"),
                    onClick: () => {
                        Modal.mount(
                            <LoginPasswordModal
                                acquisitionSession={acquisitionSession}
                            />,
                        );
                    },
                },
                {
                    text: t("SECURITY_KEY_RETRY_LOGIN"),
                    onClick: () => acquisitionSession.attemptFido2Login(),
                },
            ]}
        >
            {t("SECURITY_KEY_LOGIN_FAILURE")}
        </Modal>
    );
}
