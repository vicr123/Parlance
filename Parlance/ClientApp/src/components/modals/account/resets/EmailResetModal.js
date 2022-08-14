import React from "react";
import Modal from "../../../Modal";
import PasswordResetModal from "./PasswordResetModal";
import UserManager from "../../../../helpers/UserManager";

export default class EmailResetModal extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            email: ""
        }
    }

    emailTextChanged(e) {
        this.setState({
            email: e.target.value
        });
    }

    render(props) {
        return <Modal heading={"Recovery"} buttons={[
            {
                text: "Back",
                onClick: () => Modal.mount(<PasswordResetModal resetMethods={this.props.resetMethods} />)
            },
            {
                text: "Reset Password",
                onClick: () => UserManager.performPasswordReset("email", {
                    email: this.state.email
                })
            }
        ]}>
            <div style={{display: "flex", flexDirection: "column"}}>
                Enter the full email address
                <input type={"text"} placeholder={`${this.props.method.user}∙∙∙@${this.props.method.domain}∙∙∙`} value={this.state.email} onChange={this.emailTextChanged.bind(this)} />
            </div>
        </Modal>
    }
}