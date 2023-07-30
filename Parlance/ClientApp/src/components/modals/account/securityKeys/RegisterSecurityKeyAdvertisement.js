import React from "react";
import Modal from "../../../Modal";
import {useTranslation} from "react-i18next";
import ModalList from "../../../ModalList";
import RegisterSecurityKeyModal from "./RegisterSecurityKeyModal";
import moment from "moment";

function SecurityKeySetupCompleteModal() {
    const {t} = useTranslation();

    return <Modal heading={t("SECURITY_KEY_ADVERTISEMENT_SETUP_SUCCESS_TITLE")} buttons={[
        Modal.OkButton
    ]}>
        {t("SECURITY_KEY_ADVERTISEMENT_SETUP_SUCCESS")}
        <br />
        <br />
        {t("SECURITY_KEY_ADVERTISEMENT_SETUP_SUCCESS_2")}
        <br />
        <br />
        {t("SECURITY_KEY_ADVERTISEMENT_SETUP_SUCCESS_3")}
    </Modal>
}

export function RegisterSecurityKeyAdvertisement({password}) {
    const {t} = useTranslation();
    
    return <Modal heading={t("SECURITY_KEY_ADVERTISEMENT_TITLE")} buttons={[
        {
            text: t("SECURITY_KEY_ADVERTISEMENT_NEVER"),
            onClick: () => {
                localStorage.setItem("passkey-advertisement-never-ask", "true");
                Modal.unmount();
            },
            destructive: true
        }]}>
        {t("SECURITY_KEY_ADVERTISEMENT")}
        <br />
        <br />
        {t("SECURITY_KEY_ADVERTISEMENT_2")}
        <ModalList>
            {[
                {
                    text: t("SECURITY_KEY_ADVERTISEMENT_OK"),
                    onClick: () => {
                        const onDone = () => {
                            Modal.mount(<SecurityKeySetupCompleteModal />)
                        }
                        Modal.mount(<RegisterSecurityKeyModal type={"cross-platform"} password={password} onDone={onDone} initialName={t("SECURITY_KEY_ADVERTISEMENT_INITIAL_NAME", {
                            date: moment().format("L")
                        })} />)
                    }
                },
                {
                    text: t("SECURITY_KEY_ADVERTISEMENT_LATER"),
                    onClick: () => {
                        Modal.unmount();
                    }
                }
            ]}
        </ModalList>
    </Modal>
}