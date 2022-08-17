import Modal from "../components/Modal";
import LoadingModal from "../components/modals/LoadingModal";
import Fetch from "./Fetch";
import LoginPasswordModal from "../components/modals/account/LoginPasswordModal";
import LoginOtpModal from "../components/modals/account/LoginOtpModal";
import EventEmitter from "eventemitter3";
import LoginPasswordResetModal from "../components/modals/account/LoginPasswordResetModal";
import PasswordResetModal from "../components/modals/account/resets/PasswordResetModal";
import i18n from "./i18n";
import CryptoJS from "crypto-js";

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
            this.#currentUser = await Fetch.get("/api/user");
            
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
            let response = await Fetch.post(`/api/user/token`, this.#loginSessionDetails);
            localStorage.setItem("token", response.token);
            await this.updateDetails();
            Modal.unmount();
        } catch (e) {
            let json = await e.json();
            
            if (this.#loginSessionDetails.newPassword) {
                this.#loginSessionDetails.password = this.#loginSessionDetails.newPassword;
                delete this.#loginSessionDetails.newPassword;
            }
            
            switch (json.status) {
                case "DisabledAccount":
                    Modal.mount(<Modal heading={i18n.t('ACCOUNT_DISABLED_TITLE')} buttons={[
                        Modal.OkButton
                    ]}>
                        {i18n.t('ACCOUNT_DISABLED_PROMPT')}
                    </Modal>);
                    return;
                case "OtpRequired":
                    Modal.mount(<LoginOtpModal />);
                    return;
                case "PasswordResetRequired":
                    Modal.mount(<LoginPasswordResetModal />);
                    return;
                case "PasswordResetRequestRequired":
                    Modal.mount(<Modal heading={i18n.t('RESET_PASSWORD')} buttons={[
                        Modal.CancelButton,
                        {
                            text: i18n.t('RESET_PASSWORD'),
                            onClick: () => this.triggerPasswordReset()
                        }
                    ]}>
                        {i18n.t('RESET_PASSWORD_PROMPT')}
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
            let response = await Fetch.post(`/api/user/reset/methods`, {
                username: this.#loginSessionDetails.username
            });
            Modal.mount(<PasswordResetModal resetMethods={response} />)
        } catch (e) {
            Modal.mount(<Modal heading={i18n.t('PASSWORD_RECOVERY_TITLE')} buttons={[
                {
                    text: i18n.t('OK'),
                    onClick: () => Modal.mount(<LoginPasswordModal />)
                }
            ]}>
                {i18n.t('PASSWORD_RECOVERY_ERROR_PROMPT')}
            </Modal>)
        }
    }
    
    async performPasswordReset(type, challenge) {
        Modal.mount(<LoadingModal />)
        try {
            await Fetch.post("/api/user/reset", {
                username: this.#loginSessionDetails.username,
                type,
                challenge
            });
            Modal.mount(<Modal heading={i18n.t('PASSWORD_RECOVERY_TITLE')} buttons={[
                {
                    text: i18n.t('OK'),
                    onClick: () => Modal.mount(<LoginPasswordModal />)
                }
            ]}>
                {i18n.t('PASSWORD_RECOVERY_SUCCESS_PROMPT')}
            </Modal>)
        } catch (e) {
            Modal.unmount(<Modal heading={"Recovery"} buttons={[Modal.OkButton]}>
                {i18n.t('PASSWORD_RECOVERY_ERROR_PROMPT_2')}
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
    
    get currentUserIsSuperuser() {
        return this.#currentUser.superuser;
    }
    
    get currentUserProfilePicture() {
        let normalised = this.#currentUser.email.trim().toLowerCase();
        let md5 = CryptoJS.MD5(normalised);
        return `https://www.gravatar.com/avatar/${md5}`;
    }
}

let mgr = new UserManager();
export default mgr;