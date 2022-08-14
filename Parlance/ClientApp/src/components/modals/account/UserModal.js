import Modal from "../../Modal";
import UserManager from "../../../helpers/UserManager";

export default function(props) {
    return <Modal heading={"User Management"} buttons={[
        {
            text: "Close",
            onClick: () => Modal.unmount()
        },
        {
            text: "Log Out",
            onClick: () => {
                UserManager.logout();
                Modal.unmount();
            }
        }
    ]}>
        Hi, {UserManager.currentUser.username}!
    </Modal>
}