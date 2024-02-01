import {AutoSubscriptionEvent, Subscription} from "@/interfaces/unsubscribe";
import {useTranslation} from "react-i18next";

export function UnsubscribeEvent({subscription}: {
    subscription: Subscription
}) {
    const {t} = useTranslation();
    
    switch (subscription.type) {
        case "translation-freeze":
            return <span>{t("Translation Freeze for project {{project}}", { project: subscription.project })}</span>
    }
}

export function AutoSubscribeEvent({autoSubscribeEvent}: {
    autoSubscribeEvent: AutoSubscriptionEvent
}) {
    const {t} = useTranslation();
    
    switch (autoSubscribeEvent.type) {
        case "translation-submit":
            return <span>{t("Submit translations")}</span>
    }
}