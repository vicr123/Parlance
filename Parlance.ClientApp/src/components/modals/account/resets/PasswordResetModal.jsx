import React from "react";
import Modal from "../../../Modal";
import ModalList from "../../../ModalList";
import EmailResetModal from "./EmailResetModal";
import LoginPasswordModal from "../LoginPasswordModal";
import { useTranslation } from "react-i18next";

export default function PasswordResetModal(props) {
    let { t } = useTranslation();

    return (
        <Modal
            heading={t("PASSWORD_RECOVERY_TITLE")}
            buttons={[
                {
                    text: t("CANCEL"),
                    onClick: () => Modal.mount(<LoginPasswordModal />),
                },
            ]}
        >
            <div style={{ display: "flex", flexDirection: "column" }}>
                {t("PASSWORD_RECOVERY_PROMPT_1")}
            </div>
            <ModalList>
                {props.resetMethods.map(method => {
                    switch (method.type) {
                        case "email":
                            return {
                                text: t("PASSWORD_RECOVERY_EMAIL", {
                                    email: `${method.user}∙∙∙@${method.domain}∙∙∙`,
                                }),
                                onClick: () =>
                                    Modal.mount(
                                        <EmailResetModal
                                            resetMethods={props.resetMethods}
                                            method={method}
                                        />,
                                    ),
                            };
                        default:
                            return null;
                    }
                })}
            </ModalList>
        </Modal>
    );
}
