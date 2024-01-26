import Modal from "../../Modal";
import React, {useState} from "react";
import LoginPasswordModal from "./LoginPasswordModal";
import UserManager from "../../../helpers/UserManager";
import {useTranslation} from "react-i18next";
import LineEdit from "../../LineEdit";
import CreateAccountModal from "./CreateAccountModal";
import LoadingModal from "../LoadingModal";
import Styles from "./LoginUsernameModal.module.css";

export default function LoginUsernameModal() {
    const [username, setUsername] = useState(UserManager.loginDetail("username"));
    const [password, setPassword] = useState("");
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
                    if (password) await UserManager.setLoginDetail("prePassword", password);
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
                      onChange={e => setUsername((e.target as HTMLInputElement).value)} autoComplete={"off"}/>
            <div className={Styles.password}>
                <LineEdit placeholder={"Password"} password={true} value={password}
                          onChange={e => setPassword((e.target as HTMLInputElement).value)}/>
            </div>
        </div>
    </Modal>;
}