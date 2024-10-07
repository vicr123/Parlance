import { useState } from "react";
import Modal from "../../../Modal";
import { PasswordResetModal } from "./PasswordResetModal";
import UserManager from "../../../../helpers/UserManager";
import { useTranslation } from "react-i18next";
import LineEdit from "../../../../components/LineEdit";
import { VerticalSpacer } from "@/components/Layouts";
import {
    PasswordResetMethod,
    PasswordResetMethodEmail,
} from "@/interfaces/users";
import { TokenAcquisitionSession } from "@/helpers/TokenAcquisitionSession";

export function EmailResetModal({
    method,
    resetMethods,
    acquisitionSession,
}: {
    method: PasswordResetMethodEmail;
    resetMethods: PasswordResetMethod[];
    acquisitionSession: TokenAcquisitionSession;
}) {
    const [email, setEmail] = useState("");
    const { t } = useTranslation();

    return (
        <Modal
            heading={t("PASSWORD_RECOVERY_TITLE")}
            buttons={[
                {
                    text: t("BACK"),
                    onClick: () =>
                        Modal.mount(
                            <PasswordResetModal
                                resetMethods={resetMethods}
                                acquisitionSession={acquisitionSession}
                            />,
                        ),
                },
                {
                    text: t("RESET_PASSWORD"),
                    onClick: () =>
                        acquisitionSession.performPasswordReset("email", {
                            email: email,
                        }),
                },
            ]}
        >
            <div style={{ display: "flex", flexDirection: "column" }}>
                {t("PASSWORD_RECOVERY_EMAIL_PROMPT_1")}
                <VerticalSpacer height={3} />
                <LineEdit
                    type={"text"}
                    placeholder={`${method.user}∙∙∙@${method.domain}∙∙∙`}
                    value={email}
                    onChange={e =>
                        setEmail((e.target as HTMLInputElement).value)
                    }
                />
            </div>
        </Modal>
    );
}
