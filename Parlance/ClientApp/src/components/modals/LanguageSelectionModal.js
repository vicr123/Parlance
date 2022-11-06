import {useTranslation} from "react-i18next";
import Modal from "../Modal";

export default function LanguageSelectionModal() {
    const {t} = useTranslation();
    
    

    return <Modal heading={t("Select Language")} buttons={[Modal.CancelButton]}>

    </Modal>
}