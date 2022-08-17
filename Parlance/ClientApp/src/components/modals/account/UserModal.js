import Modal from "../../Modal";
import UserManager from "../../../helpers/UserManager";
import {useTranslation} from "react-i18next";
import ModalList from "../../ModalList";
import {useNavigate} from "react-router-dom";

export default function(props) {
    const {t} = useTranslation();
    
    let bottomButtons = [];
    if (UserManager.currentUserIsSuperuser) {
        bottomButtons.push({
            text: t('PARLANCE_ADMINISTRATION'),
            onClick: () => {
                document.location = "/admin";
            }
        })
    }
    
    bottomButtons.push({
        text: t("ACCOUNT_SETTINGS"),
        onClick: () => {
            document.location = "/account";
        }
    })
    
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
        <ModalList>
            {bottomButtons}
        </ModalList>
    </Modal>
}