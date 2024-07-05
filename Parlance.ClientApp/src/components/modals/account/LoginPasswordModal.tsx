import Modal from "../../Modal";
import React, { useEffect, useState } from "react";
import LoginUsernameModal from "./LoginUsernameModal";
import UserManager from "../../../helpers/UserManager";
import { useTranslation } from "react-i18next";
import LineEdit from "../../LineEdit";
import ModalList from "../../ModalList";
import { VerticalSpacer } from "@/components/Layouts";

export default function LoginPasswordModal() {
    const [password, setPassword] = useState(
        UserManager.loginDetail("prePassword"),
    );
    const { t } = useTranslation();

    useEffect(() => {
        UserManager.setLoginDetail("prePassword");
    }, []);

    const loginTypes = UserManager.loginTypes.map(type => {
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
                                onClick: () => UserManager.attemptFido2Login(),
                            },
                        ]}
                    </ModalList>
                );
        }
    });

    return (
        <Modal
            heading={t("LOG_IN_PASSWORD_TITLE", {
                username: UserManager.loginDetail("username"),
            })}
            buttons={[
                {
                    text: t("BACK"),
                    onClick: () => Modal.mount(<LoginUsernameModal />),
                },
                {
                    text: t("FORGOT_PASSWORD"),
                    onClick: () => UserManager.triggerPasswordReset(),
                },
                {
                    text: t("NEXT"),
                    onClick: () => {
                        UserManager.setLoginDetail("password", password);
                        UserManager.setLoginDetail("type", "password");
                        UserManager.attemptLogin();
                    },
                },
            ]}
        >
            {loginTypes}
        </Modal>
    );
}
