import BackButton from "../../components/BackButton";
import {useNavigate} from "react-router-dom";
import React, {useEffect, useState} from "react";
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

function SecurityKeysUi({password}) {
    const {t} = useTranslation();

    const registerKey = type => {
        Modal.mount(<RegisterSecurityKeyModal type={type} password={password}/>)
    };

    return <>
        <Container style={{
            marginTop: "20px"
        }}>
            <VerticalLayout>
                <PageHeading level={3}>{t("ACCOUNT_SETTINGS_MANAGE_SECURITY_KEYS")}</PageHeading>
                <span>{t("If you wish, you can use security keys to log into Parlance instead of using a password and Two Factor Authentication code.")}</span>
            </VerticalLayout>

            <VerticalLayout>
                <SelectableList items={[
                    t("Registered Security Keys"),
                    {
                        contents: "Key 1",
                        onClick: () => {
                        }
                    },
                    {
                        contents: "Key 2",
                        onClick: () => {
                        }
                    },
                    {
                        contents: "Key 3",
                        onClick: () => {
                        }
                    },
                    {
                        contents: "Key 4",
                        onClick: () => {
                        }
                    }
                ]}/>
                <span>{t("You can use any of these keys to log into Parlance.")}</span>
            </VerticalLayout>

            <VerticalSpacer/>
            <VerticalLayout>
                {/*<SelectableList onClick={registerKey}>{t("Register New Security Key")}</SelectableList>*/}
                <SelectableList items={[
                    {
                        contents: t("Register New Security Key"),
                        onClick: () => registerKey("cross-platform")
                    },
                    {
                        contents: t("Register New Biometric"),
                        onClick: () => registerKey("platform")
                    }
                ]}/>
            </VerticalLayout>
        </Container>
    </>
}

export default function SecurityKeys() {
    const [password, setPassword] = useState();
    const [securityKeyState, setSecurityKeyState] = useState(null);
    const navigate = useNavigate();
    const {t} = useTranslation();

    const requestPassword = () => {
        const accept = password => {
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
            setSecurityKeyState(await Fetch.post("/api/user/otp", {
                password: password
            }));
            Modal.unmount();
        } catch (error) {
            if (error.status === 403) {
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
        content = <SecurityKeysUi password={password}/>
    }

    return <div>
        <BackButton onClick={() => navigate("..")}/>
        {content}
    </div>
}