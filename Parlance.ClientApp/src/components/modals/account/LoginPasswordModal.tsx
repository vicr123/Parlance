import Modal from "../../Modal";
import React, { useEffect, useState } from "react";
import LoginUsernameModal from "./LoginUsernameModal";
import UserManager from "../../../helpers/UserManager";
import { useTranslation } from "react-i18next";
import LineEdit from "../../LineEdit";
import ModalList from "../../ModalList";
import { VerticalSpacer } from "@/components/Layouts";
import { TokenAcquisitionSession } from "@/helpers/TokenAcquisitionSession";

export function LoginPasswordModal({
    acquisitionSession,
}: {
    acquisitionSession: TokenAcquisitionSession;
}) {
    const [password, setPassword] = useState(acquisitionSession.prePassword);
    const { t } = useTranslation();

    const loginTypes = acquisitionSession.loginTypes.map(type => {
        switch (type) {
            case "password":
                return (
                    <div
                        key={"password"}
                        style={{ display: "flex", flexDirection: "column" }}
                    >
                        {t("LOG_IN_PASSWORD_PROMPT")}
                        <VerticalSpacer height={3} />
                        <LineEdit
                            password={true}
                            placeholder={t("PASSWORD")}
                            value={password}
                            onChange={e =>
                                setPassword(
                                    (e.target as HTMLInputElement).value,
                                )
                            }
                        />
                    </div>
                );
            case "fido":
                //Ensure the browser supports webauthn
                if (!window.PublicKeyCredential) return null;

                return (
                    <ModalList key={"fido"}>
                        {[
                            {
                                text: t("LOG_IN_USE_SECURITY_KEY_PROMPT"),
                                onClick: () =>
                                    acquisitionSession.attemptFido2Login(),
                            },
                        ]}
                    </ModalList>
                );
        }
    });

    return (
        <Modal
            heading={t("LOG_IN_PASSWORD_TITLE", {
                username: acquisitionSession.username,
            })}
            buttons={[
                {
                    text: t("BACK"),
                    onClick: () => acquisitionSession.quit(),
                },
                {
                    text: t("FORGOT_PASSWORD"),
                    onClick: () => acquisitionSession.triggerPasswordReset(),
                },
                {
                    text: t("NEXT"),
                    onClick: () => {
                        acquisitionSession.setLoginDetail("password", password);
                        acquisitionSession.setLoginDetail("type", "password");
                        acquisitionSession.attemptLogin();
                    },
                },
            ]}
        >
            {loginTypes}
        </Modal>
    );
}
