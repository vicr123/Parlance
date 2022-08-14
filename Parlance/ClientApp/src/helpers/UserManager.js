import Modal from "../components/Modal";
import LoadingModal from "../components/modals/LoadingModal";
import Fetch from "./Fetch";
import LoginPasswordModal from "../components/modals/account/LoginPasswordModal";
import LoginOtpModal from "../components/modals/account/LoginOtpModal";
import EventEmitter from "eventemitter3";
import LoginPasswordResetModal from "../components/modals/account/LoginPasswordResetModal";
import PasswordResetModal from "../components/modals/account/resets/PasswordResetModal";

class UserManager extends EventEmitter {
    #loginSessionDetails;
    #currentUser;
    
    constructor() {
        super();
        this.#loginSessionDetails = {};
        this.#currentUser = null;
        
        this.updateDetails();
    }
    
    async updateDetails() {
        if (localStorage.getItem("token")) {
            this.#currentUser = await Fetch.get("/user");
            
            this.emit("currentUserChanged", this.#currentUser);
        } else {
            this.#currentUser = null;
            
            this.emit("currentUserChanged", this.#currentUser);
        }
    }
    
    setLoginDetail(key, value) {
        this.#loginSessionDetails[key] = value;
    }
    
    loginDetail(key) {
        return this.#loginSessionDetails[key] || "";
    }
    
    clearLoginDetails() {
        this.#loginSessionDetails = {};
    }
    
    async attemptLogin() {
        Modal.mount(<LoadingModal />)
        
        try {
            let response = await Fetch.post(`/user/token`, this.#loginSessionDetails);
            localStorage.setItem("token", response.token);
            await this.updateDetails();
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
                    Modal.mount(<LoginPasswordResetModal />);
                    return;
                case "PasswordResetRequestRequired":
                    Modal.mount(<Modal heading={"Reset Password"} buttons={[
                        Modal.CancelButton,
                        {
                            text: "Reset Password",
                            onClick: () => this.triggerPasswordReset()
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
    
    async triggerPasswordReset() {
        Modal.mount(<LoadingModal />);
        try {
            let response = await Fetch.post(`/user/reset/methods`, {
                username: this.#loginSessionDetails.username
            });
            Modal.mount(<PasswordResetModal resetMethods={response} />)
        } catch (e) {
            Modal.mount(<Modal heading={"Recovery"} buttons={[
                {
                    text: "OK",
                    onClick: () => Modal.mount(<LoginPasswordModal />)
                }
            ]}>
                Sorry, your password can't be reset.
            </Modal>)
        }
    }
    
    async performPasswordReset(type, challenge) {
        Modal.mount(<LoadingModal />)
        try {
            await Fetch.post("/user/reset", {
                username: this.#loginSessionDetails.username,
                type,
                challenge
            });
            Modal.mount(<Modal heading={"Recovery"} buttons={[
                {
                    text: "OK",
                    onClick: () => Modal.mount(<LoginPasswordModal />)
                }
            ]}>
                If the data you entered was correct, information has been sent to you about how to reset your password.
            </Modal>)
        } catch (e) {
            Modal.unmount(<Modal heading={"Recovery"} buttons={[Modal.OkButton]}>
                Sorry, there was a problem resetting your password.
            </Modal>)
        }
    }
    
    async logout() {
        localStorage.removeItem("token");
        await this.updateDetails();
    }
    
    get isLoggedIn() {
        return !!localStorage.getItem("token");
    }
    
    get currentUser() {
        return this.#currentUser;
    }
}

let mgr = new UserManager();
export default mgr;