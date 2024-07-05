import { useTranslation } from "react-i18next";
import Modal from "../../Modal";
import LoginUsernameModal from "./LoginUsernameModal";
import { VerticalLayout, VerticalSpacer } from "../../Layouts";
import LineEdit from "../../LineEdit";
import React, { useContext, useState } from "react";
import LoadingModal from "../LoadingModal";
import ErrorModal from "../ErrorModal";
import UserManager from "../../../helpers/UserManager";
import Fetch from "../../../helpers/Fetch";
import { RegisterSecurityKeyAdvertisement } from "./securityKeys/RegisterSecurityKeyAdvertisement";
import { TokenResponseToken } from "../../../interfaces/users";
import { ServerInformationContext } from "@/context/ServerInformationContext";

export default function CreateAccountModal() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const { t } = useTranslation();
    const serverInformation = useContext(ServerInformationContext);

    let modal = (
        <Modal
            heading={t("CREATE_ACCOUNT")}
            buttons={[
                {
                    text: t("BACK"),
                    onClick: () => Modal.mount(<LoginUsernameModal />),
                },
                {
                    text: t("CREATE_ACCOUNT"),
                    onClick: async () => {
                        if (password !== confirmPassword) return;

                        Modal.mount(<LoadingModal />);
                        try {
                            let result = await Fetch.post<TokenResponseToken>(
                                "/api/user",
                                {
                                    username: username,
                                    password: password,
                                    emailAddress: email,
                                },
                            );

                            await UserManager.setToken(result.token);

                            if (
                                window.PublicKeyCredential &&
                                !localStorage.getItem(
                                    "passkey-advertisement-never-ask",
                                )
                            ) {
                                Modal.mount(
                                    <RegisterSecurityKeyAdvertisement
                                        password={password}
                                    />,
                                );
                                return;
                            }

                            Modal.unmount();
                        } catch (error) {
                            Modal.mount(
                                <ErrorModal
                                    error={error}
                                    onContinue={() => Modal.mount(modal)}
                                />,
                            );
                        }
                    },
                },
            ]}
        >
            <VerticalLayout>
                <span>
                    {t("CREATE_ACCOUNT_PROMPT", {
                        type: serverInformation.accountName,
                    })}
                </span>
                <LineEdit
                    placeholder={t("USERNAME")}
                    value={username}
                    onChange={e =>
                        setUsername((e.target as HTMLInputElement).value)
                    }
                />
                <LineEdit
                    placeholder={t("EMAIL_ADDRESS")}
                    value={email}
                    onChange={e =>
                        setEmail((e.target as HTMLInputElement).value)
                    }
                />
            </VerticalLayout>
            <VerticalSpacer height={40} />
            <VerticalLayout>
                <span>{t("PASSWORD_SET_SECURITY_PROMPT")}</span>
                <LineEdit
                    password={true}
                    placeholder={t("PASSWORD")}
                    value={password}
                    onChange={e =>
                        setPassword((e.target as HTMLInputElement).value)
                    }
                />
                <LineEdit
                    password={true}
                    placeholder={t("CONFIRM_PASSWORD")}
                    value={confirmPassword}
                    onChange={e =>
                        setConfirmPassword((e.target as HTMLInputElement).value)
                    }
                />
            </VerticalLayout>
        </Modal>
    );

    return modal;
}
