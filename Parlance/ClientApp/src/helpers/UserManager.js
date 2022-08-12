import Modal from "../components/Modal";
import LoadingModal from "../components/modals/LoadingModal";
import Fetch from "./Fetch";
import LoginPasswordModal from "../components/modals/account/LoginPasswordModal";
import LoginOtpModal from "../components/modals/account/LoginOtpModal";

class UserManager {
    #loginDetails;
    
    constructor() {
        this.#loginDetails = {};
    }
    
    setLoginDetail(key, value) {
        this.#loginDetails[key] = value;
    }
    
    loginDetail(key) {
        return this.#loginDetails[key] || "";
    }
    
    clearLoginDetails() {
        this.#loginDetails = {};
    }
    
    async attemptLogin() {
        Modal.mount(<LoadingModal />)
        
        try {
            let response = await Fetch.post(`/user/token`, this.#loginDetails);
            localStorage.setItem("token", response.token);
            Modal.unmount();
        } catch (e) {
            let json = await e.json();
            
            switch (json.status) {
                case "DisabledAccount":
                    Modal.mount(<Modal heading={"Your account is disabled"} buttons={[
                        Modal.OkButton
                    ]}>
                        Your account has been disabled.
                    </Modal>);
                    return;
                case "OtpRequired":
                    Modal.mount(<LoginOtpModal />);
                    return;
                case "PasswordResetRequired":
                    Modal.mount(<Modal heading={"Password Reset Required"} buttons={[
                        Modal.OkButton
                    ]}>
                        Password Reset Required.
                    </Modal>);
                    return;
                case "PasswordResetRequestRequired":
                    Modal.mount(<Modal heading={"Reset Password"} buttons={[
                        Modal.CancelButton,
                        {
                            text: "Reset Password",
                            onClick: () => {}
                        }
                    ]}>
                        You need to reset your password.
                    </Modal>);
                    return;
                default:
                    Modal.mount(<LoginPasswordModal />)
            }
        }
    }
    
    logout() {
        localStorage.removeItem("token");
    }
    
    get isLoggedIn() {
        return !!localStorage.getItem("token");
    }
}

let mgr = new UserManager();
export default mgr;