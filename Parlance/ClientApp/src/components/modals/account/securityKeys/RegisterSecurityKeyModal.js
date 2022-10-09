import Modal from "../../../Modal";
import {VerticalLayout} from "../../../Layouts";
import LineEdit from "../../../LineEdit";
import React, {useEffect, useState} from "react";
import {useTranslation} from "react-i18next";
import Fetch from "../../../../helpers/Fetch";
import LoadingModal from "../../LoadingModal";
import {decode, encode} from "../../../../helpers/Base64";

let pendingSecurityCredential = false;

function BrowserRegisterSecurityKeyModalFailure({nickname, type, password}) {
    const {t} = useTranslation();

    return <Modal buttons={[
        Modal.CancelButton,
        {
            text: t("Retry Registration"),
            onClick: () => {
                Modal.mount(<RequestBrowserRegisterSecurityKeyModal nickname={nickname} type={type}
                                                                    password={password}/>)
            }
        }
    ]}>
        {t("The security key was not able to be added.")}
    </Modal>
}

function RequestBrowserRegisterSecurityKeyModal({nickname, type, password}) {
    useEffect(() => {
        (async () => {
            if (pendingSecurityCredential) return;

            try {
                pendingSecurityCredential = true;

                //Request details from server
                let credDetails = await Fetch.post("/api/user/keys/prepareregister", {
                    password: password,
                    authenticatorAttachmentType: type
                });


                let credential = await navigator.credentials.create({
                    publicKey: {
                        challenge: decode(credDetails.authenticatorOptions.challenge),
                        rp: credDetails.authenticatorOptions.rp,
                        user: {
                            id: decode(credDetails.authenticatorOptions.user.id),
                            name: credDetails.authenticatorOptions.user.name,
                            displayName: credDetails.authenticatorOptions.user.displayName,
                        },
                        pubKeyCredParams: credDetails.authenticatorOptions.pubKeyCredParams,
                        authenticatorSelection: credDetails.authenticatorOptions.authenticatorSelection,
                        timeout: credDetails.authenticatorOptions.timeout,
                        attestation: credDetails.authenticatorOptions.attestation
                    }
                });

                Modal.mount(<LoadingModal/>)
                let response = await Fetch.post("/api/user/keys/register", {
                    password: password,
                    id: credDetails.id,
                    name: nickname,
                    response: {
                        authenticatorAttachment: credential.authenticatorAttachment,
                        id: credential.id,
                        rawId: encode(credential.rawId),
                        response: {
                            attestationObject: encode(credential.response.attestationObject),
                            clientDataJSON: encode(credential.response.clientDataJSON)
                        },
                        type: credential.type
                    }
                });

                Modal.unmount();
            } catch (e) {
                console.log(e);
                Modal.mount(<BrowserRegisterSecurityKeyModalFailure nickname={nickname} type={type}
                                                                    password={password}/>)
            } finally {
                pendingSecurityCredential = false;
            }
        })();
    }, []);
    const {t} = useTranslation();

    return <Modal buttons={[{
        text: t("CANCEL"),
        onClick: () => {
        }
    }]}>
        {t("Follow the instructions in your browser to add a security key.")}
    </Modal>
}

export default function RegisterSecurityKeyModal({type, password}) {
    const [securityKeyName, setSecurityKeyName] = useState("");
    const {t} = useTranslation();


    return <Modal heading={t("Register New Security Key")} buttons={[Modal.CancelButton, {
        text: t("NEXT"),
        onClick: () => {
            Modal.mount(<RequestBrowserRegisterSecurityKeyModal nickname={securityKeyName} type={type}
                                                                password={password}/>)
        }
    }]}>
        <VerticalLayout>
            <div>{t('Name this security key')}</div>
            <LineEdit placeholder={t('Security Key Name')} value={securityKeyName}
                      onChange={e => setSecurityKeyName(e.target.value)}/>
        </VerticalLayout>
    </Modal>
}