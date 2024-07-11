import { useTranslation } from "react-i18next";
import Modal from "../../Modal";
import React from "react";

export function LoginSecurityKeyModal() {
    const { t } = useTranslation();

    return <Modal>{t("SECURITY_KEY_LOGIN_PROMPT")}</Modal>;
}
