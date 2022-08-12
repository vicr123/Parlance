import Modal from "../../Modal";
import React from "react";
import LoginPasswordModal from "./LoginPasswordModal";
import UserManager from "../../../helpers/UserManager";

export default class LoginUsernameModal extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = {
            username: UserManager.loginDetail("username")
        }
    }
    
    usernameTextChanged(e) {
        this.setState({
            username: e.target.value
        });
    }
    
    render(props) {
        return <Modal heading={"Log In"} buttons={[
            Modal.CancelButton,
            {
                text: "Create Account"
            },
            {
                text: "Next",
                onClick: () => {
                    UserManager.setLoginDetail("username", this.state.username);
                    Modal.mount(<LoginPasswordModal />)
                }
            }
        ]}>
            <div style={{display: "flex", flexDirection: "column"}}>
                Use your vicr123 account to log in
                <input type={"text"} placeholder={"Username"} value={this.state.username} onChange={this.usernameTextChanged.bind(this)} />
            </div>
        </Modal>
    }
}