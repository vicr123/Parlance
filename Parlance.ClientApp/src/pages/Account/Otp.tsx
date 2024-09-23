import BackButton from "../../components/BackButton";
import Container from "../../components/Container";
import { VerticalLayout, VerticalSpacer } from "../../components/Layouts";
import PageHeading from "../../components/PageHeading";
import LineEdit from "../../components/LineEdit";
import SelectableList from "../../components/SelectableList";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import React, {
    useEffect,
    useRef,
    useState,
    useContext,
    ForwardedRef,
} from "react";
import Modal from "../../components/Modal";
import PasswordConfirmModal from "../../components/modals/account/PasswordConfirmModal";
import Fetch from "../../helpers/Fetch";
import Styles from "./Otp.module.css";
import QRCode from "react-qr-code";
import LoadingModal from "../../components/modals/LoadingModal";
import ErrorModal from "../../components/modals/ErrorModal";
import { useReactToPrint } from "react-to-print";
import i18n from "../../helpers/i18n";
import {
    OtpState,
    OtpStateDisabled,
    OtpStateEnabled,
} from "@/interfaces/users";
import { ServerInformationContext } from "@/context/ServerInformationContext";
import UserManager from "@/helpers/UserManager";

function OtpBlock({ otpState }: { otpState: OtpStateEnabled }) {
    return (
        <div className={Styles.backupCodesContainer}>
            {otpState.backupCodes.map(code => (
                <span
                    dir={"ltr"}
                    className={[
                        Styles.backupCode,
                        ...[code.used ? [Styles.backupCodeUsed] : []],
                    ].join(" ")}
                >
                    {code.code.match(/.{1,4}/g)!.join(" ")}
                </span>
            ))}
        </div>
    );
}

const PrintableOtpCodes = React.forwardRef(function PrintableOtpCodes(
    { otpState }: { otpState: OtpStateEnabled },
    ref: ForwardedRef<HTMLDivElement>,
) {
    const { t } = useTranslation();
    const serverInformation = useContext(ServerInformationContext);

    return (
        <div style={{ display: "none" }}>
            <div ref={ref} className={Styles.printPage}>
                <VerticalLayout>
                    <span className={Styles.printHeader}>Parlance</span>
                    <span className={Styles.printSubtitle}>
                        {t("BACKUP_CODES_PRINT_TITLE")}
                    </span>
                </VerticalLayout>
                <hr />
                <VerticalLayout>
                    <span>{t("BACKUP_CODES_PRINT_PROMPT_1")}</span>
                    <span>{t("BACKUP_CODES_PRINT_PROMPT_2")}</span>
                    <span>{t("BACKUP_CODES_PRINT_PROMPT_3")}</span>
                    <span>
                        {t("BACKUP_CODES_PRINT_PROMPT_4", {
                            date: new Intl.DateTimeFormat(i18n.language, {
                                dateStyle: "full",
                            }).format(new Date()),
                        })}
                    </span>
                    <OtpBlock otpState={otpState} />
                </VerticalLayout>
                <VerticalSpacer height={20} />
                <VerticalLayout>
                    <PageHeading level={3}>
                        {t("BACKUP_CODES_PRINT_PROMPT_5")}
                    </PageHeading>
                    <span>
                        {t("BACKUP_CODES_PRINT_PROMPT_6", {
                            account: serverInformation.accountName,
                        })}
                    </span>
                </VerticalLayout>
            </div>
        </div>
    );
});

function OtpDisabledContent({
    otpState,
    onReload,
    password,
}: {
    otpState: OtpStateDisabled;
    onReload: () => void;
    password: string;
}) {
    const [otpCode, setOtpCode] = useState("");
    const { t } = useTranslation();

    const performEnable = async () => {
        Modal.mount(<LoadingModal />);
        try {
            await Fetch.post("/api/user/otp/enable", {
                password: password,
                otpCode: otpCode,
            });
            onReload();
        } catch (error) {
            Modal.mount(<ErrorModal error={error} />);
        }
    };

    return (
        <>
            <Container>
                <VerticalLayout>
                    <PageHeading level={3}>
                        {t("ACCOUNT_SETTINGS_TWO_FACTOR")}
                    </PageHeading>
                    <span>
                        {t("ACCOUNT_SETTINGS_TWO_FACTOR_WELCOME_PROMPT")}
                    </span>
                    <span>{t("ACCOUNT_SETTINGS_TWO_FACTOR_PREAMBLE")}</span>
                </VerticalLayout>
            </Container>
            <Container>
                <div className={Styles.setupContainer}>
                    <span className={Styles.setupNumber}>1</span>
                    <span>{t("ACCOUNT_SETTINGS_TWO_FACTOR_STEP_ONE")}</span>
                </div>
            </Container>
            <Container>
                <div className={Styles.setupContainer}>
                    <span className={Styles.setupNumber}>2</span>
                    <div>
                        <VerticalLayout>
                            <span>
                                {t("ACCOUNT_SETTINGS_TWO_FACTOR_STEP_TWO_1")}
                            </span>
                            <QRCode
                                className={Styles.setupQr}
                                value={`otpauth://totp/Victor%20Tran?secret=${otpState.key}`}
                            />
                            <span>
                                {t("ACCOUNT_SETTINGS_TWO_FACTOR_STEP_TWO_2")}
                            </span>
                            <span className={Styles.manualSetupKey}>
                                {otpState.key.match(/.{1,4}/g)!.join(" ")}
                            </span>
                        </VerticalLayout>
                    </div>
                </div>
            </Container>
            <Container>
                <div className={Styles.setupContainer}>
                    <span className={Styles.setupNumber}>3</span>
                    <span>{t("ACCOUNT_SETTINGS_TWO_FACTOR_STEP_THREE")}</span>
                </div>
            </Container>
            <Container
                style={{
                    marginTop: "20px",
                }}
            >
                <VerticalLayout>
                    <PageHeading level={3}>
                        {t("ACCOUNT_SETTINGS_TWO_FACTOR_COMPLETE_SETUP")}
                    </PageHeading>
                    <span>
                        {t("ACCOUNT_SETTINGS_TWO_FACTOR_COMPLETE_SETUP_PROMPT")}
                    </span>
                    <LineEdit
                        placeholder={t("TWO_FACTOR_AUTHENTICATION_CODE")}
                        value={otpCode}
                        onChange={e =>
                            setOtpCode((e.target as HTMLInputElement).value)
                        }
                    />
                    <SelectableList onClick={performEnable}>
                        {t("ENABLE_TWO_FACTOR_AUTHENTICATION")}
                    </SelectableList>
                </VerticalLayout>
            </Container>
        </>
    );
}

function OtpEnabledContent({
    otpState,
    onReload,
    password,
}: {
    otpState: OtpStateEnabled;
    onReload: () => void;
    password: string;
}) {
    const navigate = useNavigate();
    const printRef = useRef<HTMLDivElement>(null);
    const { t } = useTranslation();
    const handlePrint = useReactToPrint({
        content: () => printRef.current!,
    });

    return (
        <>
            <Container>
                <VerticalLayout>
                    <PageHeading level={3}>
                        {t("ACCOUNT_SETTINGS_TWO_FACTOR")}
                    </PageHeading>
                    <span>
                        {t("ACCOUNT_SETTINGS_TWO_FACTOR_ENABLED_PROMPT_1")}
                    </span>
                    <span>
                        {t("ACCOUNT_SETTINGS_TWO_FACTOR_ENABLED_PROMPT_2")}
                    </span>
                    <OtpBlock otpState={otpState} />
                    <span>
                        {t("ACCOUNT_SETTINGS_TWO_FACTOR_ENABLED_PROMPT_3")}
                    </span>
                </VerticalLayout>
            </Container>
            <PrintableOtpCodes otpState={otpState} ref={printRef} />
            <Container>
                <VerticalLayout>
                    <PageHeading level={3}>{t("ACTIONS")}</PageHeading>
                    <SelectableList
                        items={[
                            {
                                contents: t("PRINT_BACKUP_CODES"),
                                onClick: () => {
                                    handlePrint();
                                },
                            },
                            {
                                contents: t("REGENERATE_BACKUP_CODES"),
                                onClick: () => {
                                    Modal.mount(
                                        <Modal
                                            heading={t(
                                                "REGENERATE_BACKUP_CODES",
                                            )}
                                            buttons={[
                                                Modal.CancelButton,
                                                {
                                                    text: t(
                                                        "REGENERATE_BACKUP_CODES",
                                                    ),
                                                    onClick: async () => {
                                                        Modal.mount(
                                                            <LoadingModal />,
                                                        );
                                                        try {
                                                            await Fetch.post(
                                                                "/api/user/otp/regenerate",
                                                                {
                                                                    password:
                                                                        password,
                                                                },
                                                            );
                                                            onReload();
                                                        } catch (error) {
                                                            Modal.mount(
                                                                <ErrorModal
                                                                    error={
                                                                        error
                                                                    }
                                                                />,
                                                            );
                                                        }
                                                    },
                                                    destructive: true,
                                                },
                                            ]}
                                        >
                                            {t(
                                                "REGENERATE_BACKUP_CODES_PROMPT",
                                            )}
                                        </Modal>,
                                    );
                                },
                            },
                            {
                                contents: t(
                                    "ACCOUNT_SETTINGS_TWO_FACTOR_DISABLE",
                                ),
                                onClick: () => {
                                    Modal.mount(
                                        <Modal
                                            heading={t(
                                                "ACCOUNT_SETTINGS_TWO_FACTOR_DISABLE",
                                            )}
                                            buttons={[
                                                Modal.CancelButton,
                                                {
                                                    text: t(
                                                        "ACCOUNT_SETTINGS_TWO_FACTOR_DISABLE",
                                                    ),
                                                    onClick: async () => {
                                                        Modal.mount(
                                                            <LoadingModal />,
                                                        );
                                                        try {
                                                            await Fetch.post(
                                                                "/api/user/otp/disable",
                                                                {
                                                                    password:
                                                                        password,
                                                                },
                                                            );
                                                            navigate("..");
                                                            Modal.unmount();
                                                        } catch (error) {
                                                            Modal.mount(
                                                                <ErrorModal
                                                                    error={
                                                                        error
                                                                    }
                                                                />,
                                                            );
                                                        }
                                                    },
                                                    destructive: true,
                                                },
                                            ]}
                                        >
                                            {t(
                                                "ACCOUNT_SETTINGS_TWO_FACTOR_DISABLE_PROMPT",
                                            )}
                                        </Modal>,
                                    );
                                },
                                type: "destructive",
                            },
                        ]}
                    />
                </VerticalLayout>
            </Container>
        </>
    );
}

export default function Otp() {
    const [password, setPassword] = useState("");
    const [otpState, setOtpState] = useState<OtpState | null>(null);
    const navigate = useNavigate();
    const { t } = useTranslation();

    const requestPassword = async () => {
        try {
            const token = await UserManager.obtainToken(
                UserManager.currentUser?.username!,
                "accountModification",
            );
            setPassword(token);
        } catch {
            navigate("..");
            Modal.unmount();
        }
    };

    const updateState = async () => {
        if (!password) return;

        Modal.mount(<LoadingModal />);
        try {
            setOtpState(
                await Fetch.post("/api/user/otp", {
                    password: password,
                }),
            );
            Modal.unmount();
        } catch (error) {
            const responseError = error as WebFetchResponse;
            if (responseError.status === 403) {
                requestPassword();
            } else {
                Modal.mount(
                    <ErrorModal
                        error={error}
                        onContinue={() => {
                            navigate("..");
                            Modal.unmount();
                        }}
                    />,
                );
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

    if (otpState === null) {
        content = (
            <Container>
                <VerticalLayout gap={0}>
                    <PageHeading level={3}>
                        {t("ACCOUNT_SETTINGS_TWO_FACTOR")}
                    </PageHeading>
                </VerticalLayout>
            </Container>
        );
    } else if (otpState.enabled) {
        content = (
            <OtpEnabledContent
                password={password}
                onReload={updateState}
                otpState={otpState}
            />
        );
    } else {
        content = (
            <OtpDisabledContent
                password={password}
                onReload={updateState}
                otpState={otpState}
            />
        );
    }

    return (
        <div>
            <BackButton onClick={() => navigate("..")} />
            {content}
        </div>
    );
}
