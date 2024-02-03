import React, {useReducer} from "react";
import {useTranslation} from "react-i18next";
import UserManager from "../../helpers/UserManager";
import Container from "../../components/Container";
import PageHeading from "../../components/PageHeading";
import Styles from "./AccountSettings.module.css";
import SmallButton from "../../components/SmallButton";
import SelectableList from "../../components/SelectableList";
import {useNavigate} from "react-router-dom";
import Modal from "../../components/Modal";
import LoadingModal from "../../components/modals/LoadingModal";
import Fetch from "../../helpers/Fetch";

export default function AccountSettings() {
    const [ignored, forceUpdate] = useReducer(x => x + 1, 0);
    const navigate = useNavigate();
    const {t} = useTranslation();

    UserManager.on("currentUserChanged", forceUpdate);

    if (!UserManager.currentUser) {
        return null;
    }

    const resendVerificationEmail = async () => {
        Modal.mount(<LoadingModal/>)
        try {
            await Fetch.post("/api/user/verification/resend", {});
            Modal.mount(<Modal heading={t("EMAIL_VERIFY_RESEND")} buttons={[Modal.OkButton]}>
                {t("VERIFICATION_EMAIL_RESEND_PROMPT")}
            </Modal>)
        } catch {
            Modal.unmount();
        }
    }

    let verifyEmailPrompt = UserManager.currentUser.emailVerified ? null : <div className={Styles.verifyEmailPrompt}>
        <PageHeading level={3}>{t("EMAIL_VERIFY_TITLE")}</PageHeading>
        <p>{t("EMAIL_VERIFY_PROMPT")}</p>
        <div className={Styles.verifyEmailButtons}>
            <SmallButton onClick={resendVerificationEmail}>{t("EMAIL_VERIFY_RESEND")}</SmallButton>
            <SmallButton onClick={() => navigate("verify")}>{t("EMAIL_VERIFY_ENTER_CODE")}</SmallButton>
        </div>
    </div>

    return <div>
        <Container>
            <div className={Styles.accountHeader}>
                <span className={Styles.accountUsername}>{UserManager.currentUser.username}</span>
                <span className={Styles.accountEmail}>{UserManager.currentUser.email}</span>

                <img className={Styles.accountImage} src={UserManager.currentUserProfilePicture}/>
                {verifyEmailPrompt}
            </div>
        </Container>
        <Container>
            <SelectableList items={[
                t("ACCOUNT_SETTINGS_PROFILE"),
                {
                    contents: t("ACCOUNT_SETTINGS_CHANGE_USERNAME"),
                    onClick: () => navigate("username")
                },
                {
                    contents: t("ACCOUNT_SETTINGS_CHANGE_PROFILE_PICTURE"),
                    onClick: () => window.open("https://en.gravatar.com/gravatars/new/", "_blank")
                },
                {
                    contents: t("ACCOUNT_SETTINGS_CHANGE_EMAIL_ADDRESS"),
                    onClick: () => navigate("email")
                },
                t("ACCOUNT_SETTINGS_SECURITY"),
                {
                    contents: t("ACCOUNT_SETTINGS_CHANGE_PASSWORD"),
                    onClick: () => navigate("password")
                },
                {
                    contents: t("ACCOUNT_SETTINGS_TWO_FACTOR"),
                    onClick: () => navigate("otp")
                },
                {
                    contents: t("ACCOUNT_SETTINGS_MANAGE_SECURITY_KEYS"),
                    onClick: () => navigate("keys")
                },
                t("ACCOUNT_SETTINGS_PRIVACY"),
                {
                    contents: t("ACCOUNT_SETTINGS_ATTRIBUTION"),
                    onClick: () => navigate("attribution")
                },
                {
                    contents: t("Notifications"),
                    onClick: () => navigate("notifications")
                }
            ]}/>
        </Container>
    </div>
}