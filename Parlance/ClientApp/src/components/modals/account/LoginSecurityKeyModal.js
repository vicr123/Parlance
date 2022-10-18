import {useTranslation} from "react-i18next";
import Modal from "../../Modal";
import React from "react";
import LoginPasswordModal from "./LoginPasswordModal";

export default function LoginSecurityKeyModal({details}) {
    const {t} = useTranslation();

    return <Modal buttons={[
        {
            text: t("CANCEL"),
            onClick: () => Modal.mount(<LoginPasswordModal/>)
        }
    ]}>
        {t("SECURITY_KEY_LOGIN_PROMPT")}
    </Modal>
}

