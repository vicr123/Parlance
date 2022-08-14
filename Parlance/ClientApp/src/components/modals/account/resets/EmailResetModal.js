import React from "react";
import Modal from "../../../Modal";
import PasswordResetModal from "./PasswordResetModal";
import UserManager from "../../../../helpers/UserManager";
import {withTranslation} from "react-i18next";

export default withTranslation()(class EmailResetModal extends React.Component {
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
        return <Modal heading={this.props.t('PASSWORD_RECOVERY_TITLE')} buttons={[
            {
                text: this.props.t("BACK"),
                onClick: () => Modal.mount(<PasswordResetModal resetMethods={this.props.resetMethods} />)
            },
            {
                text: this.props.t('RESET_PASSWORD'),
                onClick: () => UserManager.performPasswordReset("email", {
                    email: this.state.email
                })
            }
        ]}>
            <div style={{display: "flex", flexDirection: "column"}}>
                {this.props.t('PASSWORD_RECOVERY_EMAIL_PROMPT_1')}
                <input type={"text"} placeholder={`${this.props.method.user}∙∙∙@${this.props.method.domain}∙∙∙`} value={this.state.email} onChange={this.emailTextChanged.bind(this)} />
            </div>
        </Modal>
    }
})