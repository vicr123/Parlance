import {useTranslation} from "react-i18next";
import Modal from "../../Modal";
import React from "react";

export default function LoginSecurityKeyModal({details}) {
    const {t} = useTranslation();

    return <Modal>
        {t("SECURITY_KEY_LOGIN_PROMPT")}
    </Modal>
}

