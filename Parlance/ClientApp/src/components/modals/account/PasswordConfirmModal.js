import {useTranslation} from "react-i18next";
import {VerticalLayout} from "../../Layouts";
import Modal from "../../Modal";
import {useState} from "react";
import LineEdit from "../../LineEdit";

export default function(props) {
    const [password, setPassword] = useState("");
    const {t} = useTranslation();
    
    return <Modal heading={t("CONFIRM_PASSWORD")} buttons={[
        Modal.CancelButton,
        {
            text: "OK",
            onClick: () => props.onAccepted(password)
        }
    ]}>
        <VerticalLayout>
            <span>{t("CONFIRM_PASSWORD_PROMPT")}</span>
            <LineEdit password={true} placeholder={t("PASSWORD")} value={password} onChange={e => setPassword(e.target.value)} />
        </VerticalLayout>
    </Modal>
}