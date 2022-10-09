import {useTranslation} from "react-i18next";
import Modal from "../../Modal";
import UserManager from "../../../helpers/UserManager";
import LoginPasswordModal from "./LoginPasswordModal";

export default function LoginSecurityKeyFailureModal({details}) {
    const {t} = useTranslation();

    return <Modal buttons={[
        {
            text: t("Use Password Instead"),
            onClick: () => {
                Modal.mount(<LoginPasswordModal/>)
            }
        },
        {
            text: t("Retry Security Key"),
            onClick: () => {
                UserManager.attemptFido2Login(details)
            }
        }
    ]}>
        {t("Unable to log you in with the security key.")}
    </Modal>
}