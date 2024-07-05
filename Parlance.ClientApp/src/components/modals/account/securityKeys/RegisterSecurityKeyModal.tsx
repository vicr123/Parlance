import Modal from "../../../Modal";
import { VerticalLayout } from "../../../Layouts";
import LineEdit from "../../../LineEdit";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Fetch from "../../../../helpers/Fetch";
import LoadingModal from "../../LoadingModal";
import { decode, encode } from "../../../../helpers/Base64";

let pendingSecurityCredential = false;

interface RegisterSecurityKeyModalProps {
    initialName: string;
    type: string;
    password: string;
    onDone: () => void;
}

interface RegisterSecurityKeyInnerModalProps {
    nickname: string;
    type: string;
    password: string;
    onDone: () => void;
}

function BrowserRegisterSecurityKeyModalFailure({
    nickname,
    type,
    password,
    onDone,
}: RegisterSecurityKeyInnerModalProps) {
    const { t } = useTranslation();

    return (
        <Modal
            buttons={[
                Modal.CancelButton,
                {
                    text: t("SECURITY_KEY_RETRY_REGISTRATION"),
                    onClick: () => {
                        Modal.mount(
                            <RequestBrowserRegisterSecurityKeyModal
                                nickname={nickname}
                                type={type}
                                password={password}
                                onDone={onDone}
                            />,
                        );
                    },
                },
            ]}
        >
            {t("SECURITY_KEY_ADD_ERROR_PROMPT")}
        </Modal>
    );
}

function RequestBrowserRegisterSecurityKeyModal({
    nickname,
    type,
    password,
    onDone,
}: RegisterSecurityKeyInnerModalProps) {
    useEffect(() => {
        (async () => {
            if (pendingSecurityCredential) return;

            try {
                pendingSecurityCredential = true;

                //Request details from server
                let credDetails = await Fetch.post<any>(
                    "/api/user/keys/prepareregister",
                    {
                        password: password,
                        authenticatorAttachmentType: type,
                    },
                );

                let credential = (await navigator.credentials.create({
                    publicKey: {
                        challenge: decode(
                            credDetails.authenticatorOptions.challenge,
                        ),
                        rp: credDetails.authenticatorOptions.rp,
                        user: {
                            id: decode(
                                credDetails.authenticatorOptions.user.id,
                            ),
                            name: credDetails.authenticatorOptions.user.name,
                            displayName:
                                credDetails.authenticatorOptions.user
                                    .displayName,
                        },
                        pubKeyCredParams:
                            credDetails.authenticatorOptions.pubKeyCredParams,
                        authenticatorSelection:
                            credDetails.authenticatorOptions
                                .authenticatorSelection,
                        timeout: credDetails.authenticatorOptions.timeout,
                        attestation:
                            credDetails.authenticatorOptions.attestation,
                    },
                })) as PublicKeyCredential;

                Modal.mount(<LoadingModal />);
                let response = await Fetch.post("/api/user/keys/register", {
                    password: password,
                    id: credDetails.id,
                    name: nickname,
                    response: {
                        authenticatorAttachment:
                            credential.authenticatorAttachment,
                        id: credential.id,
                        rawId: encode(credential.rawId),
                        response: {
                            attestationObject: encode(
                                (
                                    credential.response as AuthenticatorAttestationResponse
                                ).attestationObject,
                            ),
                            clientDataJSON: encode(
                                credential.response.clientDataJSON,
                            ),
                        },
                        type: credential.type,
                    },
                });

                Modal.unmount();

                await onDone();
            } catch (e) {
                console.log(e);
                Modal.mount(
                    <BrowserRegisterSecurityKeyModalFailure
                        nickname={nickname}
                        type={type}
                        password={password}
                        onDone={onDone}
                    />,
                );
            } finally {
                pendingSecurityCredential = false;
            }
        })();
    }, []);
    const { t } = useTranslation();

    return <Modal>{t("SECURITY_KEY_ADD_PROMPT")}</Modal>;
}

export default function RegisterSecurityKeyModal({
    type,
    password,
    onDone,
    initialName = "",
}: RegisterSecurityKeyModalProps) {
    const [securityKeyName, setSecurityKeyName] = useState(initialName);
    const { t } = useTranslation();

    return (
        <Modal
            heading={t("SECURITY_KEY_ADD")}
            buttons={[
                Modal.CancelButton,
                {
                    text: t("NEXT"),
                    onClick: () => {
                        Modal.mount(
                            <RequestBrowserRegisterSecurityKeyModal
                                nickname={securityKeyName}
                                type={type}
                                password={password}
                                onDone={onDone}
                            />,
                        );
                    },
                },
            ]}
        >
            <VerticalLayout>
                <div>{t("SECURITY_KEY_ADD_NAME")}</div>
                <LineEdit
                    placeholder={t("SECURITY_KEY_ADD_NAME_PROMPT")}
                    value={securityKeyName}
                    onChange={e =>
                        setSecurityKeyName((e.target as HTMLInputElement).value)
                    }
                />
            </VerticalLayout>
        </Modal>
    );
}
