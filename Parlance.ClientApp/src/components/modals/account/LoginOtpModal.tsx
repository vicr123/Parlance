import Modal from "../../Modal";
import React, { useState } from "react";
import { LoginPasswordModal } from "./LoginPasswordModal";
import { useTranslation } from "react-i18next";
import LineEdit from "../../LineEdit";
import { VerticalLayout, VerticalSpacer } from "../../Layouts";
import Styles from "./LoginOtpModal.module.css";
import { TokenAcquisitionSession } from "@/helpers/TokenAcquisitionSession";

export function LoginOtpModal({
    acquisitionSession,
}: {
    acquisitionSession: TokenAcquisitionSession;
}) {
    const [otp, setOtp] = useState("");
    const { t } = useTranslation();

    return (
        <Modal
            heading={t("TWO_FACTOR_AUTHENTICATION")}
            buttons={[
                {
                    text: t("BACK"),
                    onClick: () =>
                        Modal.mount(
                            <LoginPasswordModal
                                acquisitionSession={acquisitionSession}
                            />,
                        ),
                },
                {
                    text: t("NEXT"),
                    onClick: () => {
                        acquisitionSession.setLoginDetail("otpToken", otp);
                        acquisitionSession.attemptLogin();
                    },
                },
            ]}
        >
            <div style={{ display: "flex", flexDirection: "column" }}>
                <VerticalLayout>
                    <span>
                        {t("LOG_IN_TWO_FACTOR_AUTHENTICATION_PROMPT_1")}
                    </span>
                    <span className={Styles.hint}>
                        {t("LOG_IN_TWO_FACTOR_AUTHENTICATION_PROMPT_2")}
                    </span>
                    <VerticalSpacer height={10} />
                    <LineEdit
                        placeholder={t("TWO_FACTOR_AUTHENTICATION_CODE")}
                        value={otp}
                        onChange={e =>
                            setOtp((e.target as HTMLInputElement).value)
                        }
                    />
                </VerticalLayout>
            </div>
        </Modal>
    );
}
