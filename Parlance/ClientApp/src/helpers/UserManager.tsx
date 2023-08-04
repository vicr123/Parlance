import Modal from "../components/Modal";
import LoadingModal from "../components/modals/LoadingModal";
import Fetch from "./Fetch";
import LoginPasswordModal from "../components/modals/account/LoginPasswordModal";
// @ts-ignore
import LoginOtpModal from "../components/modals/account/LoginOtpModal";
import EventEmitter from "eventemitter3";
// @ts-ignore
import LoginPasswordResetModal from "../components/modals/account/LoginPasswordResetModal";
// @ts-ignore
import PasswordResetModal from "../components/modals/account/resets/PasswordResetModal";
import i18n from "./i18n";
import CryptoJS from "crypto-js";
// @ts-ignore
import LoginErrorModal from "../components/modals/account/LoginErrorModal";
import React from "react";
// @ts-ignore
import LoginSecurityKeyModal from "../components/modals/account/LoginSecurityKeyModal";
// @ts-ignore
import LoginSecurityKeyFailureModal from "../components/modals/account/LoginSecurityKeyFailureModal";
import {decode, encode} from "./Base64";
// @ts-ignore
import {
    RegisterSecurityKeyAdvertisement
} from "../components/modals/account/securityKeys/RegisterSecurityKeyAdvertisement";
import {
    LoginType, PasswordResetChallenge, PasswordResetType,
    TokenResponseFido,
    TokenResponseFidoOptionsCredentials,
    TokenResponseToken,
    User
} from "../interfaces/users";

class UserManager extends EventEmitter {
    #loginSessionDetails: Record<string, any>;
    #currentUser: User | null;
    #availableLoginTypes?: LoginType[];

    constructor() {
        super();
        this.#loginSessionDetails = {};
        this.#currentUser = null;

        this.updateDetails();
        i18n.on("languageChanged", () => this.emit("currentUserChanged", this.#currentUser));
    }

    get isLoggedIn() {
        return !!localStorage.getItem("token");
    }

    get currentUser() {
        return this.#currentUser;
    }

    get currentUserIsSuperuser() {
        return this.#currentUser?.superuser;
    }

    get currentUserProfilePicture() {
        if (!this.#currentUser) return "";
        let normalised = this.#currentUser.email.trim().toLowerCase();
        let md5 = CryptoJS.MD5(normalised);
        return `https://www.gravatar.com/avatar/${md5}`;
    }

    get loginTypes() {
        return this.#availableLoginTypes;
    }

    async updateDetails() {
        if (localStorage.getItem("token")) {
            try {
                this.#currentUser = await Fetch.get<User>("/api/user");
                this.emit("currentUserChanged", this.#currentUser);
            } catch {
                //Couldn't get user details, so log out
                await this.logout();
                Modal.mount(<LoginErrorModal/>)
            }
        } else {
            this.#currentUser = null;

            this.emit("currentUserChanged", this.#currentUser);
        }
    }

    setLoginDetail(key: string, value?: any) {
        this.#loginSessionDetails[key] = value;
    }

    loginDetail(key: string) {
        return this.#loginSessionDetails[key] || "";
    }

    clearLoginDetails() {
        this.#loginSessionDetails = {};
    }

    async setUsername(username: string) {
        this.#availableLoginTypes = await Fetch.post("/api/user/tokentypes", {
            username: username
        });
        this.setLoginDetail("username", username);
    }

    async attemptLogin({fido2Details = null} = {}) {
        Modal.mount(<LoadingModal/>)

        try {
            let response = await Fetch.post<TokenResponseToken>(`/api/user/token`, this.#loginSessionDetails);
            await this.setToken(response.token);
            
            if (!fido2Details && window.PublicKeyCredential && !localStorage.getItem("passkey-advertisement-never-ask")) {
                Modal.mount(<RegisterSecurityKeyAdvertisement password={this.#loginSessionDetails.newPassword || this.#loginSessionDetails.password} />)
                return;
            }
            
            Modal.unmount();
        } catch (e: FetchResponse<any>) {
            let json = await e.json();

            if (this.#loginSessionDetails.newPassword) {
                this.#loginSessionDetails.password = this.#loginSessionDetails.newPassword;
                delete this.#loginSessionDetails.newPassword;
            }

            this.setLoginDetail("keyTokenId", null);
            this.setLoginDetail("keyResponse", null);

            if (fido2Details) {
                Modal.mount(<LoginSecurityKeyFailureModal details={fido2Details}/>)
                return;
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
                    Modal.mount(<LoginOtpModal/>);
                    return;
                case "PasswordResetRequired":
                    Modal.mount(<LoginPasswordResetModal/>);
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
                    Modal.mount(<LoginPasswordModal/>)
            }
        }
    }

    async triggerPasswordReset() {
        Modal.mount(<LoadingModal/>);
        try {
            let response = await Fetch.post(`/api/user/reset/methods`, {
                username: this.#loginSessionDetails.username
            });
            Modal.mount(<PasswordResetModal resetMethods={response}/>)
        } catch (e) {
            Modal.mount(<Modal heading={i18n.t('PASSWORD_RECOVERY_TITLE')} buttons={[
                {
                    text: i18n.t('OK'),
                    onClick: () => Modal.mount(<LoginPasswordModal/>)
                }
            ]}>
                {i18n.t('PASSWORD_RECOVERY_ERROR_PROMPT')}
            </Modal>)
        }
    }

    async performPasswordReset(type: PasswordResetType, challenge: PasswordResetChallenge) {
        Modal.mount(<LoadingModal/>)
        try {
            await Fetch.post("/api/user/reset", {
                username: this.#loginSessionDetails.username,
                type,
                challenge
            });
            Modal.mount(<Modal heading={i18n.t('PASSWORD_RECOVERY_TITLE')} buttons={[
                {
                    text: i18n.t('OK'),
                    onClick: () => Modal.mount(<LoginPasswordModal/>)
                }
            ]}>
                {i18n.t('PASSWORD_RECOVERY_SUCCESS_PROMPT')}
            </Modal>)
        } catch (e) {
            Modal.mount(<Modal heading={"Recovery"} buttons={[Modal.OkButton]}>
                {i18n.t('PASSWORD_RECOVERY_ERROR_PROMPT_2')}
            </Modal>)
        }
    }

    async setToken(token: string) {
        localStorage.setItem("token", token);
        await this.updateDetails();
    }

    async logout() {
        localStorage.removeItem("token");
        await this.updateDetails();
    }

    async attemptFido2Login() {
        Modal.mount(<LoginSecurityKeyModal/>)

        let details: any;
        try {
            details = await Fetch.post<TokenResponseFido>("/api/user/token", {
                type: "fido",
                username: this.loginDetail("username")
            });
        } catch {
            Modal.mount(<LoginSecurityKeyFailureModal/>);
            return;
        }

        //Perform webauthn authentication
        // noinspection ExceptionCaughtLocallyJS
        try {
            let assertion = await navigator.credentials.get({
                publicKey: {
                    challenge: decode(details.options.challenge),
                    allowCredentials: details.options.allowCredentials.map((x: TokenResponseFidoOptionsCredentials) => ({
                        type: x.type,
                        id: decode(x.id)
                    })),
                    userVerification: details.options.userVerification,
                    extensions: details.options.extensions
                }
            }) as PublicKeyCredential;

            console.log(assertion);
            if (!assertion) throw assertion;
            
            const response = assertion.response as AuthenticatorAssertionResponse;

            this.setLoginDetail("type", "fido");
            this.setLoginDetail("keyTokenId", details.id);
            this.setLoginDetail("keyResponse", {
                authenticatorAttachment: assertion.authenticatorAttachment,
                id: assertion.id,
                rawId: encode(assertion.rawId),
                type: assertion.type,
                response: {
                    authenticatorData: encode(response.authenticatorData),
                    clientDataJSON: encode(response.clientDataJSON),
                    signature: encode(response.signature),
                    userHandle: encode(response.userHandle!)
                }
            });

            await this.attemptLogin({
                fido2Details: details
            });
        } catch (e) {
            console.log(e);
            Modal.mount(<LoginPasswordModal/>)
        }
    }
}

let mgr = new UserManager();
export default mgr;