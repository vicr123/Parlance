import BackButton from "../../components/BackButton";
import {useNavigate} from "react-router-dom";
import React, {useEffect, useState, useContext, ReactNode} from "react";
import {useTranslation} from "react-i18next";
import Modal from "../../components/Modal";
import PasswordConfirmModal from "../../components/modals/account/PasswordConfirmModal";
import LoadingModal from "../../components/modals/LoadingModal";
import Fetch from "../../helpers/Fetch";
import ErrorModal from "../../components/modals/ErrorModal";
import Container from "../../components/Container";
import {VerticalLayout, VerticalSpacer} from "../../components/Layouts";
import PageHeading from "../../components/PageHeading";
import SelectableList from "../../components/SelectableList";
import RegisterSecurityKeyModal from "../../components/modals/account/securityKeys/RegisterSecurityKeyModal";

import Styles from "./SecurityKeys.module.css";
import {ServerInformationContext} from "@/context/ServerInformationContext.js";
import {SecurityKey} from "../../interfaces/users";

function KeyList({keys, title, after, onManageKey}: {
    keys: SecurityKey[]
    after: ReactNode
    title: string
    onManageKey: (key: SecurityKey) => void
}) {
    if (keys.length === 0) return null;

    return <VerticalLayout>
        <SelectableList items={[
            title,
            ...keys.map(key => ({
                contents: key.application === "Parlance" ? key.name : <div className={Styles.SecurityKey}>
                    <span className={Styles.SecurityKeyName}>{key.name}</span>
                    <span className={Styles.SecurityKeyApplication}>{key.application}</span>
                </div>,
                onClick: () => onManageKey(key)
            })),
        ]}/>
        <span>{after}</span>
    </VerticalLayout>
}

function SecurityKeysUi({password, onUpdateKeys, keys}: {
    password: string
    onUpdateKeys: () => void
    keys: SecurityKey[]
}) {
    const {t} = useTranslation();
    const serverInformation = useContext(ServerInformationContext);

    const manageKey = (key: SecurityKey) => {
        Modal.mount(<Modal heading={t("SECURITY_KEY_DEREGISTER")} buttons={[
            Modal.CancelButton,
            {
                text: t("SECURITY_KEY_DEREGISTER"),
                destructive: true,
                onClick: async () => {
                    Modal.mount(<LoadingModal/>)
                    try {
                        await Fetch.post(`/api/user/keys/${key.id}/delete`, {
                            password: password
                        });

                        await onUpdateKeys();
                    } catch (err) {
                        Modal.mount(<ErrorModal error={err}/>)
                    }
                }
            }
        ]}>
            {t("SECURITY_KEY_DEREGISTER_PROMPT", {
                key: key.name,
                application: key.application
            })}
        </Modal>)
    }

    const registerKey = (type: string) => {
        //Ensure the browser supports webauthn
        if (!window.PublicKeyCredential) {
            Modal.mount(<Modal heading={t("translation:UNSUPPORTED_BROWSER")} buttons={[Modal.OkButton]}>
                <span>{t("SECURITY_KEY_UNSUPPORTED_BROWSER_PROMPT")}</span>
                <ul>
                    <li>Google Chrome</li>
                    <li>Firefox</li>
                    <li>Microsoft Edge</li>
                    <li>Safari</li>
                </ul>
            </Modal>)
            return;
        }

        Modal.mount(<RegisterSecurityKeyModal type={type} password={password} onDone={onUpdateKeys} initialName={""}/>)
    };

    return <>
        <Container style={{
            marginTop: "20px"
        }}>
            <VerticalLayout>
                <PageHeading level={3}>{t("ACCOUNT_SETTINGS_MANAGE_SECURITY_KEYS")}</PageHeading>
                <span>{t("ACCOUNT_SETTINGS_MANAGE_SECURITY_KEYS_PROMPT")}</span>
            </VerticalLayout>

            {<KeyList keys={keys.filter(key => key.application === "Parlance")}
                      title={t("SECURITY_KEY_REGISTERED_SECURITY_KEYS")}
                      after={t("SECURITY_KEY_REGISTERED_SECURITY_KEYS_PROMPT")} onManageKey={manageKey}/>}

            {<KeyList keys={keys.filter(key => key.application !== "Parlance")}
                      title={t("SECURITY_KEY_OTHER_SECURITY_KEYS")}
                      after={t("translation:SECURITY_KEY_OTHER_SECURITY_KEYS_PROMPT", {account: serverInformation.accountName})}
                      onManageKey={manageKey}/>}

            <VerticalSpacer/>
            <VerticalLayout>
                {/*<SelectableList onClick={registerKey}>{t("Register New Security Key")}</SelectableList>*/}
                <SelectableList items={[
                    {
                        contents: t("SECURITY_KEY_REGISTER_SECURITY_KEY"),
                        onClick: () => registerKey("")
                    }
                ]}/>
            </VerticalLayout>
        </Container>
    </>
}

export default function SecurityKeys() {
    const [password, setPassword] = useState("");
    const [securityKeyState, setSecurityKeyState] = useState(null);
    const navigate = useNavigate();
    const {t} = useTranslation();

    const requestPassword = () => {
        const accept = (password: string) => {
            setPassword(password);
        };

        const reject = () => {
            navigate("..");
            Modal.unmount();
        }

        Modal.mount(<PasswordConfirmModal onAccepted={accept} onRejected={reject}/>)
    }

    const updateState = async () => {
        if (!password) return;

        Modal.mount(<LoadingModal/>);
        try {
            setSecurityKeyState(await Fetch.post("/api/user/keys", {
                password: password
            }));
            Modal.unmount();
        } catch (error) {
            const responseError = error as WebFetchResponse;
            if (responseError.status === 403) {
                requestPassword();
            } else {
                Modal.mount(<ErrorModal error={error} onContinue={() => {
                    navigate("..");
                    Modal.unmount();
                }}/>)
            }
        }
    };

    useEffect(() => {
        updateState();
    }, [password]);

    useEffect(() => {
        requestPassword();
    }, []);

    let content;

    if (securityKeyState === null) {
        content = <Container style={{
            marginTop: "20px"
        }}>
            <VerticalLayout gap={0}>
                <PageHeading level={3}>{t("ACCOUNT_SETTINGS_MANAGE_SECURITY_KEYS")}</PageHeading>
            </VerticalLayout>
        </Container>
    } else {
        content = <SecurityKeysUi password={password} onUpdateKeys={updateState} keys={securityKeyState}/>
    }

    return <div>
        <BackButton onClick={() => navigate("..")}/>
        {content}
    </div>
}