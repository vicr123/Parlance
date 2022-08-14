import Modal from "../../Modal";
import UserManager from "../../../helpers/UserManager";
import {useTranslation} from "react-i18next";

export default function(props) {
    let {t} = useTranslation();
    
    return <Modal heading={t('USER_MANAGEMENT')} buttons={[
        {
            text: t('CLOSE'),
            onClick: () => Modal.unmount()
        },
        {
            text: t('LOG_OUT'),
            onClick: () => {
                UserManager.logout();
                Modal.unmount();
            }
        }
    ]}>
        {t('USER_MANAGEMENT_PROMPT', {username: UserManager.currentUser.username})}
    </Modal>
}