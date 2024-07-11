import Modal from "../../Modal";
import React, { useState } from "react";
import LoginUsernameModal from "./LoginUsernameModal";
import UserManager from "../../../helpers/UserManager";
import { useTranslation } from "react-i18next";
import LineEdit from "../../LineEdit";

export function LoginPasswordResetModal() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const { t } = useTranslation();

    return (
        <Modal
            heading={t("RESET_PASSWORD")}
            buttons={[
                {
                    text: t("CANCEL"),
                    onClick: () => Modal.mount(<LoginUsernameModal />),
                },
                {
                    text: t("OK"),
                    onClick: () => {
                        if (password !== confirmPassword) {
                            return;
                        }

                        UserManager.setLoginDetail("newPassword", password);
                        UserManager.attemptLogin();
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
