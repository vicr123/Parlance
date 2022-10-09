import Modal from "../../Modal";
import React, {useState} from "react";
import LoginUsernameModal from "./LoginUsernameModal";
import UserManager from "../../../helpers/UserManager";
import {useTranslation} from "react-i18next";
import LineEdit from "../../LineEdit";
import ModalList from "../../ModalList";

export default function LoginPasswordModal() {
    const [password, setPassword] = useState("");
    const {t} = useTranslation();

    const loginTypes = UserManager.loginTypes.map(type => {
        switch (type.type) {
            case "password":
                return <div key={"password"} style={{display: "flex", flexDirection: "column"}}>
                    {t('LOG_IN_PASSWORD_PROMPT')}
                    <LineEdit password={true} placeholder={t('PASSWORD')} value={password}
                              onChange={e => setPassword(e.target.value)}/>
                </div>
            case "fido":
                return <ModalList>
                    {[
                        {
                            text: t("Use Security Key"),
                            onClick: () => UserManager.attemptFido2Login(type)
                        }
                    ]}
                </ModalList>
        }
    });

    return <Modal heading={t("LOG_IN_PASSWORD_TITLE", {username: UserManager.loginDetail("username")})} buttons={[
        {
            text: t('BACK'),
            onClick: () => Modal.mount(<LoginUsernameModal/>)
        },
        {
            text: t('FORGOT_PASSWORD'),
            onClick: () => UserManager.triggerPasswordReset()
        },
        {
            text: t('NEXT'),
            onClick: () => {
                UserManager.setLoginDetail("password", password);
                UserManager.setLoginDetail("type", "password");
                UserManager.attemptLogin();
            }
        }
    ]}>
        {loginTypes}
    </Modal>
}

