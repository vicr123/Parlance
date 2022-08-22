import Container from "../../components/Container";
import PageHeading from "../../components/PageHeading";
import {useTranslation} from "react-i18next";
import SelectableList from "../../components/SelectableList";
import {VerticalLayout, VerticalSpacer} from "../../components/Layouts";
import {useState} from "react";
import PasswordConfirmModal from "../../components/modals/account/PasswordConfirmModal";
import Modal from "../../components/Modal";
import Fetch from "../../helpers/Fetch";
import LoadingModal from "../../components/modals/LoadingModal";
import {useNavigate} from "react-router-dom";
import UserManager from "../../helpers/UserManager";
import BackButton from "../../components/BackButton";
import LineEdit from "../../components/LineEdit";

export default function(props) {
    const [verificationCode, setVerificationCode] = useState("");
    const navigate = useNavigate();
    const {t} = useTranslation();
    
    if (UserManager.currentUser.emailVerified) {
        return <div>
            <BackButton onClick={() => navigate("..")} />
            <Container style={{
                marginTop: "20px"
            }}>
                <PageHeading level={3}>{t("VERIFY_EMAIL_SUCCESS")}</PageHeading>
                <p>{t("VERIFY_EMAIL_SUCCESS_PROMPT")}</p>
            </Container>
        </div>
    }

    const performVerification = async () => {
        if (verificationCode === "") return;

        //Perform the username change
        Modal.mount(<LoadingModal />);
        try {
            await Fetch.post("/api/user/verification", {
                verificationCode: verificationCode
            });
            await UserManager.updateDetails();
            
            Modal.mount(<Modal heading={t("VERIFY_EMAIL_SUCCESS")} buttons={[
                {
                    text: t("OK"),
                    onClick: () => {
                        navigate("..");
                        Modal.unmount();
                    }
                }
            ]}>
                {t("VERIFY_EMAIL_SUCCESS_PROMPT")}
            </Modal>)
        } catch (ex) {
            Modal.mount(<Modal heading={t("VERIFY_EMAIL_FAILED_1")} buttons={[Modal.OkButton]}>
                <VerticalLayout>
                    <span>{t("VERIFY_EMAIL_FAILED_2")}</span>
                    <span>{t("VERIFY_EMAIL_FAILED_3")}</span>
                </VerticalLayout>
            </Modal>)
        }
    }

    return <div>
        <BackButton onClick={() => navigate("..")} />
        <Container style={{
            marginTop: "20px"
        }}>
            <VerticalLayout gap={0}>
                <PageHeading level={3}>{t("VERIFY_EMAIL")}</PageHeading>
                <p>{t("VERIFY_EMAIL_PROMPT")}</p>
                <LineEdit placeholder={t("VERIFY_EMAIL_VERIFICATION_CODE")} value={verificationCode} onChange={e => setVerificationCode(e.target.value)} />
                <VerticalSpacer height={20} />
                <SelectableList onClick={performVerification}>{t("VERIFY_EMAIL")}</SelectableList>
            </VerticalLayout>
        </Container>
    </div>
}