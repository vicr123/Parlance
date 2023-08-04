import Modal from "../../Modal";
import React, {FormEvent, ReactElement} from "react";
import UserManager from "../../../helpers/UserManager";
import LoginPasswordModal from "./LoginPasswordModal";
import {TFunction, withTranslation} from "react-i18next";
import LineEdit from "../../LineEdit";
import {VerticalLayout, VerticalSpacer} from "../../Layouts";
import Styles from "./LoginOtpModal.module.css";

interface LoginOtpModalProps {
    t: TFunction
}

interface LoginOtpModalState {
    otp: string
}

class LoginOtpModal extends React.Component<LoginOtpModalProps, LoginOtpModalState> {
    constructor(props: LoginOtpModalProps) {
        super(props);

        this.state = {
            otp: ""
        }
    }

    otpTextChanged(e: FormEvent) {
        this.setState({
            otp: (e.target as HTMLInputElement).value
        });
    }

    render() {
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
                <VerticalLayout>
                    <span>{this.props.t('LOG_IN_TWO_FACTOR_AUTHENTICATION_PROMPT_1')}</span>
                    <span className={Styles.hint}>{this.props.t('LOG_IN_TWO_FACTOR_AUTHENTICATION_PROMPT_2')}</span>
                    <VerticalSpacer height={10} />
                    <LineEdit placeholder={this.props.t('TWO_FACTOR_AUTHENTICATION_CODE')} value={this.state.otp} onChange={this.otpTextChanged.bind(this)} />
                </VerticalLayout>
            </div>
        </Modal>
    }
}

export default withTranslation()(LoginOtpModal);