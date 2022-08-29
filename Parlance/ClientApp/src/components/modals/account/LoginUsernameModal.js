import Modal from "../../Modal";
import React from "react";
import LoginPasswordModal from "./LoginPasswordModal";
import UserManager from "../../../helpers/UserManager";
import {withTranslation} from "react-i18next";
import LineEdit from "../../LineEdit";
import CreateAccountModal from "./CreateAccountModal";

export default withTranslation()(class LoginUsernameModal extends React.Component {
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
        return <Modal heading={this.props.t("LOG_IN")} buttons={[
            Modal.CancelButton,
            {
                text: this.props.t('CREATE_ACCOUNT'),
                onClick: () => Modal.mount(<CreateAccountModal />)
            },
            {
                text: this.props.t('NEXT'),
                onClick: () => {
                    UserManager.setLoginDetail("username", this.state.username);
                    Modal.mount(<LoginPasswordModal />)
                }
            }
        ]}>
            <div style={{display: "flex", flexDirection: "column"}}>
                {this.props.t('LOG_IN_PROMPT')}
                <LineEdit placeholder={this.props.t('USERNAME')} value={this.state.username} onChange={this.usernameTextChanged.bind(this)} />
            </div>
        </Modal>
    }
})