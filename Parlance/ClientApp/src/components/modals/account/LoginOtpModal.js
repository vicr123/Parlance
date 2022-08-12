import Modal from "../../Modal";
import React from "react";
import LoginUsernameModal from "./LoginUsernameModal";
import UserManager from "../../../helpers/UserManager";
import LoginPasswordModal from "./LoginPasswordModal";

export default class LoginOtpModal extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            otp: ""
        }
    }

    otpTextChanged(e) {
        this.setState({
            otp: e.target.value
        });
    }

    render(props) {
        return <Modal heading={"Two Factor Authentication"} buttons={[
            {
                text: "Back",
                onClick: () => Modal.mount(<LoginPasswordModal />)
            },
            {
                text: "Next",
                onClick: () => {
                    UserManager.setLoginDetail("otpToken", this.state.otp);
                    UserManager.attemptLogin();
                }
            }
        ]}>
            <div style={{display: "flex", flexDirection: "column"}}>
                Enter your Two Factor Authentication code
                You can also use a 12 digit backup code
                <input type={"text"} placeholder={"Two Factor Authentication code"} value={this.state.otp} onChange={this.otpTextChanged.bind(this)} />
            </div>
        </Modal>
    }
}