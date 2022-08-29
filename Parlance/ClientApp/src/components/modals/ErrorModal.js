import {useTranslation} from "react-i18next";
import Modal from "../Modal";
import {VerticalLayout} from "../Layouts";
import {useEffect, useState} from "react";

export default function ErrorModal({error}) {
    const {t} = useTranslation();
    const [message, setMessage] = useState(t("ERROR_GENERIC"));
    
    useEffect(() => {
        (async () => {
            try {
                if (!error) return;
                
                let json = await error.json();
                let jsonError = json.error;
                
                switch (jsonError) {
                    case "UnknownUser":
                        setMessage(t("ERROR_UNKNOWN_USER"))
                        return;
                    case "PermissionAlreadyGranted":
                        setMessage(t("ERROR_PERMISSION_ALREADY_GRANTED"))
                }
            } catch {
                
            }
        })();
    }, [error])
    
    return <Modal buttons={[Modal.OkButton]}>
        <VerticalLayout>
            <span>{message}</span>
        </VerticalLayout>
    </Modal>
}