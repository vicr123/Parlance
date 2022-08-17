import Modal from "../../Modal";
import React from "react";
import LoginUsernameModal from "./LoginUsernameModal";
import UserManager from "../../../helpers/UserManager";
import {withTranslation} from "react-i18next";

export default withTranslation()(class LoginPasswordResetModal extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            password: "",
            confirmPassword: ""
        }
    }

    passwordTextChanged(e) {
        this.setState({
            password: e.target.value
        });
    }

    confirmPasswordTextChanged(e) {
        this.setState({
            confirmPassword: e.target.value
        });
    }

    render(props) {
        return <Modal heading={this.props.t('RESET_PASSWORD')} buttons={[
            {
                text: this.props.t('CANCEL'),
                onClick: () => Modal.mount(<LoginUsernameModal />)
            },
            {
                text: this.props.t('OK'),
                onClick: () => {
                    if (this.state.password !== this.state.confirmPassword) {
                        return;
                    }
                    
                    UserManager.setLoginDetail("newPassword", this.state.password);
                    UserManager.attemptLogin();
                }
            }
        ]}>
            <div style={{display: "flex", flexDirection: "column"}}>
                {this.props.t('LOG_IN_PASSWORD_RESET_PROMPT_1')}
                {this.props.t('PASSWORD_SET_SECURITY_PROMPT')}
                <input type={"password"} placeholder={this.props.t('PASSWORD')} value={this.state.password} onChange={this.passwordTextChanged.bind(this)} />
                <input type={"password"} placeholder={this.props.t('CONFIRM_PASSWORD')} value={this.state.confirmPassword} onChange={this.confirmPasswordTextChanged.bind(this)} />
            </div>
        </Modal>
    }
});