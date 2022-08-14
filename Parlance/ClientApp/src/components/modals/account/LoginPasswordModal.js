import Modal from "../../Modal";
import React from "react";
import LoginUsernameModal from "./LoginUsernameModal";
import UserManager from "../../../helpers/UserManager";

export default class LoginPasswordModal extends React.Component {
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
        return <Modal heading={`Hello, ${UserManager.loginDetail("username")}`} buttons={[
            {
                text: "Back",
                onClick: () => Modal.mount(<LoginUsernameModal />)
            },
            {
                text: "Forgot Password",
                onClick: () => UserManager.triggerPasswordReset()
            },
            {
                text: "Next",
                onClick: () => {
                    UserManager.setLoginDetail("password", this.state.password);
                    UserManager.attemptLogin();
                }
            }
        ]}>
            <div style={{display: "flex", flexDirection: "column"}}>
                Enter your password
                <input type={"password"} placeholder={"Password"} value={this.state.password} onChange={this.passwordTextChanged.bind(this)} />
            </div>
        </Modal>
    }
}