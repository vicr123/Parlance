import Modal from "../../Modal";
import React from "react";
import LoginUsernameModal from "./LoginUsernameModal";
import UserManager from "../../../helpers/UserManager";
import {withTranslation} from "react-i18next";

export default withTranslation()(class LoginPasswordModal extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            password: UserManager.loginDetail("password")
        }
    }

    passwordTextChanged(e) {
        this.setState({
            password: e.target.value
        });
    }

    render(props) {
        return <Modal heading={this.props.t("LOG_IN_PASSWORD_TITLE", {username: UserManager.loginDetail("username")})} buttons={[
            {
                text: this.props.t('BACK'),
                onClick: () => Modal.mount(<LoginUsernameModal />)
            },
            {
                text: this.props.t('FORGOT_PASSWORD'),
                onClick: () => UserManager.triggerPasswordReset()
            },
            {
                text: this.props.t('NEXT'),
                onClick: () => {
                    UserManager.setLoginDetail("password", this.state.password);
                    UserManager.attemptLogin();
                }
            }
        ]}>
            <div style={{display: "flex", flexDirection: "column"}}>
                {this.props.t('LOG_IN_PASSWORD_PROMPT')}
                <input type={"password"} placeholder={this.props.t('PASSWORD')} value={this.state.password} onChange={this.passwordTextChanged.bind(this)} />
            </div>
        </Modal>
    }
})