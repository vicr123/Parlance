import Modal from "../../Modal";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import LineEdit from "../../LineEdit";
import { TokenAcquisitionSession } from "@/helpers/TokenAcquisitionSession";

export function LoginPasswordResetModal({
    acquisitionSession,
}: {
    acquisitionSession: TokenAcquisitionSession;
}) {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const { t } = useTranslation();

    return (
        <Modal
            heading={t("RESET_PASSWORD")}
            buttons={[
                {
                    text: t("CANCEL"),
                    onClick: () => acquisitionSession.quit(),
                },
                {
                    text: t("OK"),
                    onClick: () => {
                        if (password !== confirmPassword) {
                            return;
                        }

                        acquisitionSession.setLoginDetail(
                            "newPassword",
                            password,
                        );
                        acquisitionSession.attemptLogin();
                    },
                },
            ]}
        >
            <div style={{ display: "flex", flexDirection: "column" }}>
                {t("LOG_IN_PASSWORD_RESET_PROMPT_1")}
                {t("PASSWORD_SET_SECURITY_PROMPT")}
                <LineEdit
                    password={true}
                    placeholder={t("PASSWORD")}
                    value={password}
                    onChange={e =>
                        setPassword((e.target as HTMLInputElement).value)
                    }
                />
                <LineEdit
                    password={true}
                    type={"password"}
                    placeholder={t("CONFIRM_PASSWORD")}
                    value={confirmPassword}
                    onChange={e =>
                        setConfirmPassword((e.target as HTMLInputElement).value)
                    }
                />
            </div>
        </Modal>
    );
}
