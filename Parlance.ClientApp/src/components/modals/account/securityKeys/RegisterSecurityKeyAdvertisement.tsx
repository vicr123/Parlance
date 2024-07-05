import React, { ReactNode } from "react";
import Modal from "../../../Modal";
import { useTranslation } from "react-i18next";
import ModalList from "../../../ModalList";
import RegisterSecurityKeyModal from "./RegisterSecurityKeyModal";
import moment from "moment";

import Styles from "./RegisterSecurityKeyAdvertisement.module.css";

interface RegisterSecurityKeyAdvertisementProps {
    password: string;
}

interface FeatureBoxProps {
    heading: string;
    children: ReactNode;
}

function SecurityKeySetupCompleteModal() {
    const { t } = useTranslation();

    return (
        <Modal
            heading={t("SECURITY_KEY_ADVERTISEMENT_SETUP_SUCCESS_TITLE")}
            buttons={[Modal.OkButton]}
        >
            {t("SECURITY_KEY_ADVERTISEMENT_SETUP_SUCCESS")}
            <br />
            <br />
            {t("SECURITY_KEY_ADVERTISEMENT_SETUP_SUCCESS_2")}
            <br />
            <br />
            {t("SECURITY_KEY_ADVERTISEMENT_SETUP_SUCCESS_3")}
        </Modal>
    );
}

function FeatureBox({ heading, children }: FeatureBoxProps) {
    return (
        <div className={Styles.FeatureBox}>
            <span className={Styles.FeatureBoxHeading}>{heading}</span>
            <span className={Styles.FeatureBoxContent}>{children}</span>
        </div>
    );
}

export function RegisterSecurityKeyAdvertisement({
    password,
}: RegisterSecurityKeyAdvertisementProps) {
    const { t } = useTranslation();

    return (
        <Modal
            heading={t("SECURITY_KEY_ADVERTISEMENT_TITLE")}
            buttons={[
                {
                    text: t("SECURITY_KEY_ADVERTISEMENT_NEVER"),
                    onClick: () => {
                        localStorage.setItem(
                            "passkey-advertisement-never-ask",
                            "true",
                        );
                        Modal.unmount();
                    },
                    destructive: true,
                },
            ]}
        >
            {t("SECURITY_KEY_ADVERTISEMENT")}
            <div className={Styles.FeaturesContainer}>
                <FeatureBox
                    heading={t("SECURITY_KEY_ADVERTISEMENT_FEATURE_1_HEADING")}
                >
                    {t("SECURITY_KEY_ADVERTISEMENT_FEATURE_1_CONTENT")}
                </FeatureBox>
                <FeatureBox
                    heading={t("SECURITY_KEY_ADVERTISEMENT_FEATURE_2_HEADING")}
                >
                    {t("SECURITY_KEY_ADVERTISEMENT_FEATURE_2_CONTENT")}
                </FeatureBox>
                <FeatureBox
                    heading={t("SECURITY_KEY_ADVERTISEMENT_FEATURE_3_HEADING")}
                >
                    {t("SECURITY_KEY_ADVERTISEMENT_FEATURE_3_CONTENT")}
                </FeatureBox>
                <FeatureBox
                    heading={t("SECURITY_KEY_ADVERTISEMENT_FEATURE_4_HEADING")}
                >
                    {t("SECURITY_KEY_ADVERTISEMENT_FEATURE_4_CONTENT")}
                </FeatureBox>
            </div>
            {t("SECURITY_KEY_ADVERTISEMENT_2")}
            <ModalList>
                {[
                    {
                        text: t("SECURITY_KEY_ADVERTISEMENT_OK"),
                        onClick: () => {
                            const onDone = () => {
                                Modal.mount(<SecurityKeySetupCompleteModal />);
                            };
                            Modal.mount(
                                <RegisterSecurityKeyModal
                                    type={""}
                                    password={password}
                                    onDone={onDone}
                                    initialName={t(
                                        "SECURITY_KEY_ADVERTISEMENT_INITIAL_NAME",
                                        {
                                            date: moment().format("L"),
                                        },
                                    )}
                                />,
                            );
                        },
                    },
                    {
                        text: t("SECURITY_KEY_ADVERTISEMENT_LATER"),
                        onClick: () => {
                            Modal.unmount();
                        },
                    },
                ]}
            </ModalList>
        </Modal>
    );
}
