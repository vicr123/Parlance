import BackButton from "../../components/BackButton";
import Container from "../../components/Container";
import {VerticalLayout, VerticalSpacer} from "../../components/Layouts";
import PageHeading from "../../components/PageHeading";
import LineEdit from "../../components/LineEdit";
import SelectableList from "../../components/SelectableList";
import {useNavigate} from "react-router-dom";
import {useTranslation} from "react-i18next";
import React, {useEffect, useRef, useState} from "react";
import Modal from "../../components/Modal";
import PasswordConfirmModal from "../../components/modals/account/PasswordConfirmModal";
import Fetch from "../../helpers/Fetch";
import Styles from "./Otp.module.css";
import QRCode from "react-qr-code";
import LoadingModal from "../../components/modals/LoadingModal";
import ErrorModal from "../../components/modals/ErrorModal";
import {useReactToPrint} from "react-to-print";
import i18n from "../../helpers/i18n";

function OtpBlock({otpState}) {
    return <div className={Styles.backupCodesContainer}>
        {otpState.backupCodes.map(code => <span className={[Styles.backupCode, ...[code.used ? [Styles.backupCodeUsed] : []]].join(" ")}>{code.code.match(/.{1,4}/g).join(" ")}</span>)}
    </div>
}

const PrintableOtpCodes = React.forwardRef(function PrintableOtpCodes({otpState}, ref) {
    const {t} = useTranslation();
    
    return <div style={{display: "none"}}>
        <div ref={ref} className={Styles.printPage}>
            <VerticalLayout>
                <span className={Styles.printHeader}>Parlance</span>
                <span className={Styles.printSubtitle}>{t("Two Factor Authentication Backup Codes")}</span>
            </VerticalLayout>
            <hr />
            <VerticalLayout>
                <span>{t("Hey there,")}</span>
                <span>{t("Your backup codes are displayed below. Keep them in a safe place.")}</span>
                <span>{t("Each backup code can only be used once, so it's a good idea to cross each one out as you use it.")}</span>
                <span>{t("This page was printed on {{date}}, so if you've regenerated your backup codes since then, these ones may not be the correct ones to use.", {
                    date: (new Intl.DateTimeFormat(i18n.language, {
                        dateStyle: "full"
                    }).format(new Date()))
                })}</span>
                <OtpBlock otpState={otpState} />
            </VerticalLayout>
            <VerticalSpacer height={20} />
            <VerticalLayout>
                <PageHeading level={3}>{t("Need more codes?")}</PageHeading>
                <span>{t("Generate more codes by visiting your Victor Tran account in Parlance. These codes will be invalidated when you do so.")}</span>
            </VerticalLayout>
        </div>
    </div>
})

function OtpDisabledContent({otpState, onReload, password}) {
    const [otpCode, setOtpCode] = useState("");
    const {t} = useTranslation();
    
    const performEnable = async () => {
        Modal.mount(<LoadingModal />)
        try {
            await Fetch.post("/api/user/otp/enable", {
                password: password,
                otpCode: otpCode
            });
            onReload();
        } catch (error) {
            Modal.mount(<ErrorModal error={error} /> )
        }
    }
    
    return <>
        <Container style={{
            marginTop: "20px"
        }}>
            <VerticalLayout>
                <PageHeading level={3}>{t("ACCOUNT_SETTINGS_TWO_FACTOR")}</PageHeading>
                <span>{t("ACCOUNT_SETTINGS_TWO_FACTOR_WELCOME_PROMPT")}</span>
            </VerticalLayout>
        </Container>
        <Container style={{
            marginTop: "20px"
        }}>
            <div className={Styles.setupContainer}>
                <span className={Styles.setupPrompt}>{t("ACCOUNT_SETTINGS_TWO_FACTOR_PREAMBLE")}</span>
                
                <span className={`${Styles.setupNumber} ${Styles.setupNumberOne}`}>1</span>
                <span className={Styles.setupStepOne}>{t("ACCOUNT_SETTINGS_TWO_FACTOR_STEP_ONE")}</span>

                <span className={`${Styles.setupNumber} ${Styles.setupNumberTwo}`}>2</span>
                <div className={Styles.setupStepTwo}>
                    <VerticalLayout>
                        <span>{t("ACCOUNT_SETTINGS_TWO_FACTOR_STEP_TWO_1")}</span>
                        <QRCode className={Styles.setupQr} value={`otpauth://totp/Victor%20Tran?secret=${otpState.key}`} />
                        <span>{t("ACCOUNT_SETTINGS_TWO_FACTOR_STEP_TWO_2")}</span>
                        <span className={Styles.manualSetupKey}>{otpState.key.match(/.{1,4}/g).join(" ")}</span>
                    </VerticalLayout>
                </div>

                <span className={`${Styles.setupNumber} ${Styles.setupNumberThree}`}>3</span>
                <span className={Styles.setupStepThree}>{t("ACCOUNT_SETTINGS_TWO_FACTOR_STEP_THREE")}</span>
            </div>
        </Container>
        <Container style={{
            marginTop: "20px"
        }}>
            <VerticalLayout>
                <PageHeading level={3}>{t("ACCOUNT_SETTINGS_TWO_FACTOR_COMPLETE_SETUP")}</PageHeading>
                <span>{t("ACCOUNT_SETTINGS_TWO_FACTOR_COMPLETE_SETUP_PROMPT")}</span>
                <LineEdit placeholder={t("TWO_FACTOR_AUTHENTICATION_CODE")} value={otpCode} onChange={e => setOtpCode(e.target.value)} />
                <SelectableList onClick={performEnable}>{t("ENABLE_TWO_FACTOR_AUTHENTICATION")}</SelectableList>
            </VerticalLayout>
        </Container>
    </>
}

function OtpEnabledContent({otpState, onReload, password}) {
    const navigate = useNavigate();
    const printRef = useRef();
    const {t} = useTranslation();
    const handlePrint = useReactToPrint({
        content: () => printRef.current
    });
    
    return <>
        <Container style={{
            marginTop: "20px"
        }}>
            <VerticalLayout>
                <PageHeading level={3}>{t("ACCOUNT_SETTINGS_TWO_FACTOR")}</PageHeading>
                <span>{t("ACCOUNT_SETTINGS_TWO_FACTOR_ENABLED_PROMPT_1")}</span>
                <span>{t("ACCOUNT_SETTINGS_TWO_FACTOR_ENABLED_PROMPT_2")}</span>
                <OtpBlock otpState={otpState} />
                <span>{t("ACCOUNT_SETTINGS_TWO_FACTOR_ENABLED_PROMPT_3")}</span>
            </VerticalLayout>
        </Container>
        <PrintableOtpCodes otpState={otpState} ref={printRef} />
        <Container style={{
            marginTop: "20px"
        }}>
            <VerticalLayout>
                <PageHeading level={3}>{t("ACTIONS")}</PageHeading>
                <SelectableList items={[
                    {
                        contents: t("PRINT_BACKUP_CODES"),
                        onClick: () => {
                            handlePrint()
                        }
                    },
                    {
                        contents: t("REGENERATE_BACKUP_CODES"),
                        onClick: () => {
                            Modal.mount(<Modal heading={t("REGENERATE_BACKUP_CODES")} buttons={[
                                Modal.CancelButton,
                                {
                                    text: t("REGENERATE_BACKUP_CODES"),
                                    onClick: async () => {
                                        Modal.mount(<LoadingModal />)
                                        try {
                                            await Fetch.post("/api/user/otp/regenerate", {
                                                password: password
                                            });
                                            onReload();
                                        } catch (error) {
                                            Modal.mount(<ErrorModal error={error} /> )
                                        }
                                    },
                                    destructive: true
                                }
                            ]}>
                                {t("REGENERATE_BACKUP_CODES_PROMPT")}
                            </Modal>)
                        }
                    },
                    {
                        contents: t("ACCOUNT_SETTINGS_TWO_FACTOR_DISABLE"),
                        onClick: () => {
                            Modal.mount(<Modal heading={t("ACCOUNT_SETTINGS_TWO_FACTOR_DISABLE")} buttons={[
                                Modal.CancelButton,
                                {
                                    text: t("ACCOUNT_SETTINGS_TWO_FACTOR_DISABLE"),
                                    onClick: async () => {
                                        Modal.mount(<LoadingModal />)
                                        try {
                                            await Fetch.post("/api/user/otp/disable", {
                                                password: password
                                            });
                                            navigate("..");
                                            Modal.unmount();
                                        } catch (error) {
                                            Modal.mount(<ErrorModal error={error} /> )
                                        }
                                    },
                                    destructive: true
                                }
                            ]}>
                                {t("ACCOUNT_SETTINGS_TWO_FACTOR_DISABLE_PROMPT")}
                            </Modal>)
                        },
                        type: "destructive"
                    }
                ]} />
            </VerticalLayout>
        </Container>
    </>
}

export default function Otp(props) {
    const [password, setPassword] = useState();
    const [otpState, setOtpState] = useState(null);
    const navigate = useNavigate();
    const {t} = useTranslation();
    
    const updateState = async () => {
        if (!password) return;
        
        Modal.mount(<LoadingModal />);
        setOtpState(await Fetch.post("/api/user/otp", {
            password: password
        }));
        Modal.unmount();
    };
    
    useEffect(() => {
        updateState();
    }, [password]);
    
    useEffect(() => {
        const accept = password => {
            setPassword(password);
        };
        
        const reject = () => {
            navigate("..");
            Modal.unmount();
        }
        
        Modal.mount(<PasswordConfirmModal onAccepted={accept} onRejected={reject} />)
    }, []);
    
    let content;
    
    if (otpState === null) {
        content = <Container style={{
            marginTop: "20px"
        }}>
            <VerticalLayout gap={0}>
                <PageHeading level={3}>{t("ACCOUNT_SETTINGS_TWO_FACTOR")}</PageHeading>
            </VerticalLayout>
        </Container>
    } else if (otpState.enabled) {
        content = <OtpEnabledContent password={password} onReload={updateState} otpState={otpState} />
    } else {
        content = <OtpDisabledContent password={password} onReload={updateState} otpState={otpState} />
    }
    
    return <div>
        <BackButton onClick={() => navigate("..")} />
        {content}
    </div>
}