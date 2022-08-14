import React from "react";
import Modal from "../../../Modal";
import ModalList from "../../../ModalList";
import EmailResetModal from "./EmailResetModal";
import LoginPasswordModal from "../LoginPasswordModal";

export default class PasswordResetModal extends React.Component {
    constructor(props) {
        super(props);
    }

    render(props) {
        return <Modal heading={"Recovery"} buttons={[
            {
                text: "Cancel",
                onClick: () => Modal.mount(<LoginPasswordModal />)
            }
        ]}>
            <div style={{display: "flex", flexDirection: "column"}}>
                Choose a method to obtain a recovery password
            </div>
            <ModalList>
                {this.props.resetMethods.map(method => {
                    switch (method.type) {
                        case "email":
                            return {
                                text: `Send email to ${method.user}∙∙∙@${method.domain}∙∙∙`,
                                onClick: () => Modal.mount(<EmailResetModal resetMethods={this.props.resetMethods}
                                                                            method={method}/>)
                            }
                        default:
                            return null;
                    }
                })}
            </ModalList>
        </Modal>
    }
}