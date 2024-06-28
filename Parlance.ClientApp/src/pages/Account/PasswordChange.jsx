import Container from "../../components/Container";
import PageHeading from "../../components/PageHeading";
import {useTranslation} from "react-i18next";
import SelectableList from "../../components/SelectableList";
import {VerticalLayout, VerticalSpacer} from "../../components/Layouts";
import {useState} from "react";
import PasswordConfirmModal from "../../components/modals/account/PasswordConfirmModal";
import Modal from "../../components/Modal";
import Fetch from "../../helpers/Fetch";
import LoadingModal from "../../components/modals/LoadingModal";
import {useNavigate} from "react-router-dom";
import UserManager from "../../helpers/UserManager";
import BackButton from "../../components/BackButton";
import LineEdit from "../../components/LineEdit";

export default function(props) {
    const [newPassword, setNewPassword] = useState("");
    const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
    const navigate = useNavigate();
    const {t} = useTranslation();

    const performPasswordChange = () => {
        if (newPassword === "") return;
        
        if (newPassword !== newPasswordConfirm) {
            Modal.mount(<Modal heading={t("PASSWORD_CHANGE_CHECK_TITLE")} buttons={[Modal.OkButton]}>
                {t("PASSWORD_CHANGE_NO_MATCH")}
            </Modal>)
            return;
        }

        const accept = async password => {
            //Perform the username change
            Modal.mount(<LoadingModal />);
            try {
                await Fetch.post("/api/user/password", {
                    newPassword: newPassword,
                    password: password
                });
                await UserManager.updateDetails();
                navigate("..");
                Modal.unmount();
            } catch (ex) {
                if (ex.status === 403) {
                    //Incorrect password
                    performPasswordChange();
                    return;
                }

                Modal.mount(<Modal heading={t("PASSWORD_CHANGE_ERROR_1")} buttons={[Modal.OkButton]}>
                    {t("PASSWORD_CHANGE_ERROR_2")}
                </Modal>)
            }
        }

        Modal.mount(<PasswordConfirmModal onAccepted={accept} />)
    }

    return <div>
        <BackButton onClick={() => navigate("..")} />
        <Container>
            <VerticalLayout gap={0}>
                <PageHeading level={3}>{t("ACCOUNT_SETTINGS_CHANGE_PASSWORD")}</PageHeading>
                <p>{t("PASSWORD_CHANGE_PROMPT_1")}</p>
                <p>{t("PASSWORD_SET_SECURITY_PROMPT")}</p>
                <LineEdit password={true} placeholder={t("PASSWORD_CHANGE_NEW_PASSWORD")} value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                <VerticalSpacer height={3} />
                <LineEdit password={true} placeholder={t("CONFIRM_PASSWORD")} value={newPasswordConfirm} onChange={e => setNewPasswordConfirm(e.target.value)} />
                <VerticalSpacer height={20} />
                <SelectableList onClick={performPasswordChange}>{t("ACCOUNT_SETTINGS_CHANGE_PASSWORD")}</SelectableList>
            </VerticalLayout>
        </Container>
    </div>
}