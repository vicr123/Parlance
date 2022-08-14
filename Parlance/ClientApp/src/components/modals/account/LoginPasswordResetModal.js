import Modal from "../../Modal";
import React from "react";
import LoginUsernameModal from "./LoginUsernameModal";
import UserManager from "../../../helpers/UserManager";

export default class LoginPasswordResetModal extends React.Component {
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
        return <Modal heading={`Reset Password`} buttons={[
            {
                text: "Cancel",
                onClick: () => Modal.mount(<LoginUsernameModal />)
            },
            {
                text: "OK",
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
                You need to set a password for your account.
                Make it a good password and save it for this account. You don't want to be reusing this password
                <input type={"password"} placeholder={"Password"} value={this.state.password} onChange={this.passwordTextChanged.bind(this)} />
                <input type={"password"} placeholder={"Confirm Password"} value={this.state.confirmPassword} onChange={this.confirmPasswordTextChanged.bind(this)} />
            </div>
        </Modal>
    }
}