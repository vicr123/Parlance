import Modal from "../components/Modal";
import LoadingModal from "../components/modals/LoadingModal";
import Fetch from "./Fetch";
import { LoginPasswordModal } from "@/components/modals/account/LoginPasswordModal";
import { LoginOtpModal } from "@/components/modals/account/LoginOtpModal";
import EventEmitter from "eventemitter3";
import { LoginPasswordResetModal } from "@/components/modals/account/LoginPasswordResetModal";
import { PasswordResetModal } from "@/components/modals/account/resets/PasswordResetModal";
import i18n from "./i18n";
import CryptoJS from "crypto-js";
import { LoginErrorModal } from "@/components/modals/account/LoginErrorModal";
import React from "react";
import { LoginSecurityKeyModal } from "@/components/modals/account/LoginSecurityKeyModal";
import { LoginSecurityKeyFailureModal } from "@/components/modals/account/LoginSecurityKeyFailureModal";
import { decode, encode } from "./Base64";
import { RegisterSecurityKeyAdvertisement } from "@/components/modals/account/securityKeys/RegisterSecurityKeyAdvertisement";
import {
    LoginType,
    PasswordResetChallenge,
    PasswordResetMethod,
    PasswordResetType,
    TokenPurpose,
    TokenResponseFido,
    TokenResponseFidoOptionsCredentials,
    TokenResponseToken,
    User,
} from "@/interfaces/users";
import { TokenAcquisitionSession } from "@/helpers/TokenAcquisitionSession";

class UserManager extends EventEmitter {
    #currentUser: User | null;

    constructor() {
        super();
        this.#currentUser = null;

        this.updateDetails();
        i18n.on("languageChanged", () =>
            this.emit("currentUserChanged", this.#currentUser),
        );
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

    obtainToken(
        username: string,
        purpose: TokenPurpose,
        prePassword: string = "",
    ) {
        return new Promise<string>(async (res, rej) => {
            const acquisitionSession = new TokenAcquisitionSession(
                username,
                purpose,
                prePassword,
                res,
                () => {
                    Modal.unmount();
                    rej();
                },
            );
            Modal.mount(<LoadingModal />);
            await acquisitionSession.loadLoginTypes();
            Modal.mount(
                <LoginPasswordModal acquisitionSession={acquisitionSession} />,
            );
        });
    }

    async updateDetails() {
        if (localStorage.getItem("token")) {
            try {
                this.#currentUser = await Fetch.get<User>("/api/user");
                this.emit("currentUserChanged", this.#currentUser);
            } catch {
                //Couldn't get user details, so log out
                await this.logout();
                Modal.mount(<LoginErrorModal />);
            }
        } else {
            this.#currentUser = null;

            this.emit("currentUserChanged", this.#currentUser);
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
}

let mgr = new UserManager();
export default mgr;
