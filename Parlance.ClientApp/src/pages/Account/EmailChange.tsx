import Container from "../../components/Container";
import PageHeading from "../../components/PageHeading";
import { useTranslation } from "react-i18next";
import SelectableList from "../../components/SelectableList";
import { VerticalLayout, VerticalSpacer } from "@/components/Layouts";
import { useState } from "react";
import Modal from "../../components/Modal";
import Fetch from "../../helpers/Fetch";
import LoadingModal from "../../components/modals/LoadingModal";
import { useNavigate } from "react-router-dom";
import UserManager from "../../helpers/UserManager";
import BackButton from "../../components/BackButton";
import LineEdit from "../../components/LineEdit";

export default function EmailChange() {
    const [newEmail, setNewEmail] = useState("");
    const navigate = useNavigate();
    const { t } = useTranslation();

    const performEmailChange = async () => {
        if (newEmail === "") return;

        try {
            const token = await UserManager.obtainToken(
                UserManager.currentUser?.username!,
                "accountModification",
            );

            //Perform the email change
            Modal.mount(<LoadingModal />);
            try {
                await Fetch.post("/api/user/email", {
                    newEmail: newEmail,
                    password: token,
                });
                await UserManager.updateDetails();
                navigate("..");
                Modal.unmount();
            } catch (exception) {
                const ex = exception as WebFetchResponse;
                if (ex.status === 403) {
                    //Incorrect password
                    performEmailChange();
                    return;
                }

                Modal.mount(
                    <Modal
                        heading={t("CHANGE_EMAIL_ERROR_1")}
                        buttons={[Modal.OkButton]}
                    >
                        {t("CHANGE_EMAIL_ERROR_2")}
                    </Modal>,
                );
            }
        } catch {}
    };

    return (
        <div>
            <BackButton onClick={() => navigate("..")} />
            <Container>
                <VerticalLayout gap={0}>
                    <PageHeading level={3}>
                        {t("ACCOUNT_SETTINGS_CHANGE_EMAIL_ADDRESS")}
                    </PageHeading>
                    <p>{t("CHANGE_EMAIL_PROMPT_1")}</p>
                    <LineEdit
                        placeholder={t("CHANGE_EMAIL_NEW_EMAIL")}
                        value={newEmail}
                        onChange={e =>
                            setNewEmail((e.target as HTMLInputElement).value)
                        }
                    />
                    <VerticalSpacer height={20} />
                    <SelectableList onClick={performEmailChange}>
                        {t("ACCOUNT_SETTINGS_CHANGE_EMAIL_ADDRESS")}
                    </SelectableList>
                </VerticalLayout>
            </Container>
        </div>
    );
}
