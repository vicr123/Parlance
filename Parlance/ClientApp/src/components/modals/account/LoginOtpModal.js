import Modal from "../../Modal";
import React from "react";
import LoginUsernameModal from "./LoginUsernameModal";
import UserManager from "../../../helpers/UserManager";
import LoginPasswordModal from "./LoginPasswordModal";
import {withTranslation} from "react-i18next";
import LineEdit from "../../LineEdit";

export default withTranslation()(class LoginOtpModal extends React.Component {
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
        return <Modal heading={this.props.t('TWO_FACTOR_AUTHENTICATION')} buttons={[
            {
                text: this.props.t('BACK'),
                onClick: () => Modal.mount(<LoginPasswordModal />)
            },
            {
                text: this.props.t('NEXT'),
                onClick: () => {
                    UserManager.setLoginDetail("otpToken", this.state.otp);
                    UserManager.attemptLogin();
                }
            }
        ]}>
            <div style={{display: "flex", flexDirection: "column"}}>
                {this.props.t('LOG_IN_TWO_FACTOR_AUTHENTICATION_PROMPT_1')}
                {this.props.t('LOG_IN_TWO_FACTOR_AUTHENTICATION_PROMPT_2')}
                <LineEdit placeholder={this.props.t('TWO_FACTOR_AUTHENTICATION_CODE')} value={this.state.otp} onChange={this.otpTextChanged.bind(this)} />
            </div>
        </Modal>
    }
})