import React from "react";
import Modal from "../../../Modal";
import ModalList from "../../../ModalList";
import { EmailResetModal } from "./EmailResetModal";
import { LoginPasswordModal } from "../LoginPasswordModal";
import { useTranslation } from "react-i18next";
import { PasswordResetMethod } from "@/interfaces/users";
import { TokenAcquisitionSession } from "@/helpers/TokenAcquisitionSession";

export function PasswordResetModal({
    resetMethods,
    acquisitionSession,
}: {
    resetMethods: PasswordResetMethod[];
    acquisitionSession: TokenAcquisitionSession;
}) {
    let { t } = useTranslation();

    return (
        <Modal
            heading={t("PASSWORD_RECOVERY_TITLE")}
            buttons={[
                {
                    text: t("CANCEL"),
                    onClick: () =>
                        Modal.mount(
                            <LoginPasswordModal
                                acquisitionSession={acquisitionSession}
                            />,
                        ),
                },
            ]}
        >
            <div style={{ display: "flex", flexDirection: "column" }}>
                {t("PASSWORD_RECOVERY_PROMPT_1")}
            </div>
            <ModalList>
                {resetMethods.map(method => {
                    switch (method.type) {
                        case "email":
                            return {
                                text: t("PASSWORD_RECOVERY_EMAIL", {
                                    email: `${method.user}∙∙∙@${method.domain}∙∙∙`,
                                }),
                                onClick: () =>
                                    Modal.mount(
                                        <EmailResetModal
                                            resetMethods={resetMethods}
                                            method={method}
                                            acquisitionSession={
                                                acquisitionSession
                                            }
                                        />,
                                    ),
                            };
                        default:
                            return undefined;
                    }
                })}
            </ModalList>
        </Modal>
    );
}
