import {VerticalLayout} from "@/components/Layouts";
import PageHeading from "@/components/PageHeading";
import {useTranslation} from "react-i18next";
import ListPageBlock from "@/components/ListPageBlock";
import React, {useEffect, useState} from "react";
import SelectableList from "@/components/SelectableList";
import Fetch from "@/helpers/Fetch";
import Modal from "@/components/Modal";
import ErrorModal from "@/components/modals/ErrorModal";
import Spinner from "@/components/Spinner";

export function GeneralNotificationSettings() {
    const [emailNotificationsOff, setEmailNotificationsOff] = useState(false);
    const [ready, setReady] = useState(false);
    const {t} = useTranslation();
    
    const updateEmailNotificationsState = async () => {
        const response = await Fetch.get<{ unsubscribed: boolean }>("/api/notifications/unsubscription");
        setEmailNotificationsOff(response.unsubscribed);
        setReady(true);
    }

    useEffect(() => {
        void updateEmailNotificationsState();
    }, []);
    
    const toggleEmailNotifications = async () => {
        const newState = !emailNotificationsOff;
        setEmailNotificationsOff(newState);
        
        try {
            await Fetch.post("/api/notifications/unsubscription", {
                unsubscribed: newState
            });
        } catch (e) {
            Modal.mount(<ErrorModal error={e} onContinue={() => window.location.reload()} okButtonText={t("RELOAD")} />)
        }
    }
    
    if (!ready) {
        return <Spinner.Container />
    }
    
    return <div>
        <ListPageBlock>
            <VerticalLayout>
                <PageHeading level={3}>{t("General")}</PageHeading>
                <span>{t("If you don't want to receive any email notifications from Parlance, you can turn off email notifications altogether.")}</span>
                <span>{t("EMAIL_UNSUBSCRIBE_COMPLETELY_DESCRIPTION_2")}</span>
                <SelectableList onClick={toggleEmailNotifications} on={!emailNotificationsOff}>{t("Email Notifications")}</SelectableList>
            </VerticalLayout>
        </ListPageBlock>
    </div>
}