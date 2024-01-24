import {useTranslation} from "react-i18next";
import Modal from "../../Modal";
import UserManager from "../../../helpers/UserManager";
import LoginPasswordModal from "./LoginPasswordModal";

export default function LoginSecurityKeyFailureModal() {
    const {t} = useTranslation();

    return <Modal buttons={[
        {
            text: t("SECURITY_KEY_USE_PASSWORD_INSTEAD"),
            onClick: () => {
                Modal.mount(<LoginPasswordModal/>)
            }
        },
        {
            text: t("SECURITY_KEY_RETRY_LOGIN"),
            onClick: () => UserManager.attemptFido2Login()
        }
    ]}>
        {t("SECURITY_KEY_LOGIN_FAILURE")}
    </Modal>
}