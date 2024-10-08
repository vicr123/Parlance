import { useTranslation } from "react-i18next";
import Modal from "../../Modal";
import UserManager from "../../../helpers/UserManager";
import LoginUsernameModal from "./LoginUsernameModal";
import React from "react";

export function LoginErrorModal() {
    const { t } = useTranslation();

    return (
        <Modal
            heading={t("LOGIN_ERROR_TITLE")}
            buttons={[
                {
                    text: t("LOG_IN_AGAIN"),
                    onClick: () => {
                        Modal.mount(<LoginUsernameModal />);
                    },
                },
                Modal.OkButton,
            ]}
        >
            {t("LOGIN_ERROR_PROMPT")}
        </Modal>
    );
}
