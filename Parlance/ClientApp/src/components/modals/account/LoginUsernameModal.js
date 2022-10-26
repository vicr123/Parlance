import Modal from "../../Modal";
import React, {useState} from "react";
import LoginPasswordModal from "./LoginPasswordModal";
import UserManager from "../../../helpers/UserManager";
import {useTranslation} from "react-i18next";
import LineEdit from "../../LineEdit";
import CreateAccountModal from "./CreateAccountModal";
import LoadingModal from "../LoadingModal";

export default function LoginUsernameModal() {
    const [username, setUsername] = useState(UserManager.loginDetail("username"));
    const {t} = useTranslation();

    return <Modal heading={t("LOG_IN")} buttons={[
        Modal.CancelButton,
        {
            text: t('CREATE_ACCOUNT'),
            onClick: () => Modal.mount(<CreateAccountModal/>)
        },
        {
            text: t('NEXT'),
            onClick: async () => {
                try {
                    Modal.mount(<LoadingModal/>)
                    await UserManager.setUsername(username);
                    Modal.mount(<LoginPasswordModal/>)
                } catch {
                    Modal.mount(<LoginUsernameModal/>)
                }
            }
        }
    ]}>
        <div style={{display: "flex", flexDirection: "column"}}>
            {t('LOG_IN_PROMPT')}
            <LineEdit placeholder={t('USERNAME')} value={username}
                      onChange={e => setUsername(e.target.value)} autoComplete={"off"}/>
        </div>
    </Modal>;
}