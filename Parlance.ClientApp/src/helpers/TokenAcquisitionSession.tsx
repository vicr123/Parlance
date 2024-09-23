import {
    LoginType,
    PasswordResetChallenge,
    PasswordResetMethod,
    PasswordResetType,
    TokenPurpose,
    TokenResponseFido,
    TokenResponseFidoOptionsCredentials,
    TokenResponseToken,
} from "@/interfaces/users";
import Fetch from "@/helpers/Fetch";
import Modal from "@/components/Modal";
import LoadingModal from "@/components/modals/LoadingModal";
import { RegisterSecurityKeyAdvertisement } from "@/components/modals/account/securityKeys/RegisterSecurityKeyAdvertisement";
import { LoginSecurityKeyFailureModal } from "@/components/modals/account/LoginSecurityKeyFailureModal";
import i18n from "@/helpers/i18n";
import { LoginOtpModal } from "@/components/modals/account/LoginOtpModal";
import { LoginPasswordResetModal } from "@/components/modals/account/LoginPasswordResetModal";
import { LoginPasswordModal } from "@/components/modals/account/LoginPasswordModal";
import { LoginSecurityKeyModal } from "@/components/modals/account/LoginSecurityKeyModal";
import { decode, encode } from "@/helpers/Base64";
import { PasswordResetModal } from "@/components/modals/account/resets/PasswordResetModal";

export class TokenAcquisitionSession {
    private readonly purpose: TokenPurpose;
    private readonly _username: string;
    private readonly _prePassword: string;
    private _availableLoginTypes: LoginType[] = [];
    private readonly _successFunction: (token: string) => void;
    private readonly _failureFunction: () => void;
    private loginSessionDetails: Record<string, any> = {};

    constructor(
        username: string,
        purpose: TokenPurpose,
        prePassword: string,
        successFunction: (token: string) => void,
        failureFunction: () => void,
    ) {
        this._username = username;
        this._prePassword = prePassword;
        this.purpose = purpose;
        this._successFunction = successFunction;
        this._failureFunction = failureFunction;
    }

    get prePassword() {
        return this._prePassword;
    }

    async loadLoginTypes() {
        this._availableLoginTypes = await Fetch.post<LoginType[]>(
            "/api/user/tokentypes",
            {
                username: this._username,
                purpose: this.purpose,
            },
        );
    }

    async attemptLogin({
        fido2Details,
    }: { fido2Details?: TokenResponseFido } = {}) {
        Modal.mount(<LoadingModal />);

        try {
            let response = await Fetch.post<TokenResponseToken>(
                `/api/user/token`,
                {
                    ...this.loginSessionDetails,
                    username: this._username,
                    purpose: this.purpose,
                },
            );
            Modal.unmount();
            this._successFunction(response.token);

            if (
                !fido2Details &&
                window.PublicKeyCredential &&
                !localStorage.getItem("passkey-advertisement-never-ask") &&
                this.purpose == "login"
            ) {
                Modal.mount(
                    <RegisterSecurityKeyAdvertisement
                        password={
                            this.loginSessionDetails.newPassword ||
                            this.loginSessionDetails.password
                        }
                    />,
                );
                return;
            }
        } catch (e: FetchResponse<any>) {
            let json = await e.json();

            if (this.loginSessionDetails.newPassword) {
                this.loginSessionDetails.password =
                    this.loginSessionDetails.newPassword;
                delete this.loginSessionDetails.newPassword;
            }

            this.setLoginDetail("keyTokenId", null);
            this.setLoginDetail("keyResponse", null);

            if (fido2Details) {
                Modal.mount(
                    <LoginSecurityKeyFailureModal acquisitionSession={this} />,
                );
                return;
            }

            switch (json.status) {
                case "DisabledAccount":
                    Modal.mount(
                        <Modal
                            heading={i18n.t("ACCOUNT_DISABLED_TITLE")}
                            buttons={[
                                {
                                    ...Modal.OkButton,
                                    onClick: () => this.quit(),
                                },
                            ]}
                        >
                            {i18n.t("ACCOUNT_DISABLED_PROMPT")}
                        </Modal>,
                    );
                    return;
                case "OtpRequired":
                    Modal.mount(<LoginOtpModal acquisitionSession={this} />);
                    return;
                case "PasswordResetRequired":
                    Modal.mount(
                        <LoginPasswordResetModal acquisitionSession={this} />,
                    );
                    return;
                case "PasswordResetRequestRequired":
                    Modal.mount(
                        <Modal
                            heading={i18n.t("RESET_PASSWORD")}
                            buttons={[
                                Modal.CancelButton,
                                {
                                    text: i18n.t("RESET_PASSWORD"),
                                    onClick: () => this.triggerPasswordReset(),
                                },
                            ]}
                        >
                            {i18n.t("RESET_PASSWORD_PROMPT")}
                        </Modal>,
                    );
                    return;
                default:
                    Modal.mount(
                        <LoginPasswordModal acquisitionSession={this} />,
                    );
            }
        }
    }

    async attemptFido2Login() {
        Modal.mount(<LoginSecurityKeyModal />);

        let details: TokenResponseFido;
        try {
            details = await Fetch.post<TokenResponseFido>("/api/user/token", {
                type: "fido",
                username: this._username,
            });
        } catch {
            Modal.mount(
                <LoginSecurityKeyFailureModal acquisitionSession={this} />,
            );
            return;
        }

        //Perform webauthn authentication
        // noinspection ExceptionCaughtLocallyJS
        try {
            let assertion = (await navigator.credentials.get({
                publicKey: {
                    challenge: decode(details.options.challenge),
                    allowCredentials: details.options.allowCredentials.map(
                        (x: TokenResponseFidoOptionsCredentials) => ({
                            type: x.type,
                            id: decode(x.id),
                        }),
                    ),
                    userVerification: details.options.userVerification,
                    extensions: details.options.extensions,
                },
            })) as PublicKeyCredential;

            console.log(assertion);
            if (!assertion) throw assertion;

            const response =
                assertion.response as AuthenticatorAssertionResponse;

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
                    userHandle: encode(response.userHandle!),
                },
            });

            await this.attemptLogin({
                fido2Details: details,
            });
        } catch (e) {
            Modal.mount(<LoginPasswordModal acquisitionSession={this} />);
        }
    }

    get loginTypes() {
        return this._availableLoginTypes;
    }

    get username() {
        return this._username;
    }

    setLoginDetail(key: string, value?: any) {
        this.loginSessionDetails[key] = value;
    }

    quit() {
        this._failureFunction();
    }
    async triggerPasswordReset() {
        Modal.mount(<LoadingModal />);
        try {
            let response = await Fetch.post<PasswordResetMethod[]>(
                `/api/user/reset/methods`,
                {
                    username: this._username,
                },
            );
            Modal.mount(
                <PasswordResetModal
                    resetMethods={response}
                    acquisitionSession={this}
                />,
            );
        } catch (e) {
            Modal.mount(
                <Modal
                    heading={i18n.t("PASSWORD_RECOVERY_TITLE")}
                    buttons={[
                        {
                            text: i18n.t("OK"),
                            onClick: () =>
                                Modal.mount(
                                    <LoginPasswordModal
                                        acquisitionSession={this}
                                    />,
                                ),
                        },
                    ]}
                >
                    {i18n.t("PASSWORD_RECOVERY_ERROR_PROMPT")}
                </Modal>,
            );
        }
    }

    async performPasswordReset(
        type: PasswordResetType,
        challenge: PasswordResetChallenge,
    ) {
        Modal.mount(<LoadingModal />);
        try {
            await Fetch.post("/api/user/reset", {
                username: this._username,
                type,
                challenge,
            });
            Modal.mount(
                <Modal
                    heading={i18n.t("PASSWORD_RECOVERY_TITLE")}
                    buttons={[
                        {
                            text: i18n.t("OK"),
                            onClick: () =>
                                Modal.mount(
                                    <LoginPasswordModal
                                        acquisitionSession={this}
                                    />,
                                ),
                        },
                    ]}
                >
                    {i18n.t("PASSWORD_RECOVERY_SUCCESS_PROMPT")}
                </Modal>,
            );
        } catch (e) {
            Modal.mount(
                <Modal
                    heading={"Recovery"}
                    buttons={[
                        { ...Modal.OkButton, onClick: () => this.quit() },
                    ]}
                >
                    {i18n.t("PASSWORD_RECOVERY_ERROR_PROMPT_2")}
                </Modal>,
            );
        }
    }
}
