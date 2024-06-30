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
    const [newUsername, setNewUsername] = useState("");
    const navigate = useNavigate();
    const {t} = useTranslation();
    
    const performUsernameChange = () => {
        if (newUsername === "") return;
        
        const accept = async password => {
            //Perform the username change
            Modal.mount(<LoadingModal />);
            try {
                await Fetch.post("/api/user/username", {
                    newUsername: newUsername,
                    password: password
                });
                await UserManager.updateDetails();
                navigate("..");
                Modal.unmount();
            } catch (ex) {
                if (ex.status === 403) {
                    //Incorrect password
                    performUsernameChange();
                    return;
                }
                
                Modal.mount(<Modal heading={t("CHANGE_USERNAME_ERROR_1")} buttons={[Modal.OkButton]}>
                    {t("CHANGE_USERNAME_ERROR_2")}
                </Modal>)
            }
        }
        
        Modal.mount(<PasswordConfirmModal onAccepted={accept} />)
    }
    
    return <div>
        <BackButton onClick={() => navigate("..")} />
        <Container>
            <VerticalLayout gap={0}>
                <PageHeading level={3}>{t("ACCOUNT_SETTINGS_CHANGE_USERNAME")}</PageHeading>
                <p>{t("CHANGE_USERNAME_PROMPT_1")}</p>
                <LineEdit placeholder={t("CHANGE_USERNAME_NEW_USERNAME")} value={newUsername} onChange={e => setNewUsername(e.target.value)} />
                <VerticalSpacer height={20} />
                <SelectableList onClick={performUsernameChange}>{t("ACCOUNT_SETTINGS_CHANGE_USERNAME")}</SelectableList>
            </VerticalLayout>
        </Container>
    </div>
}