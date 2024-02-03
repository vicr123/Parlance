import {AutoSubscription, AutoSubscriptionEventName, Subscription, SubscriptionChannelName} from "@/interfaces/unsubscribe";
import {useTranslation} from "react-i18next";

export function UnsubscribeEvent({subscription}: {
    subscription: Subscription
}) {
    const {t} = useTranslation();
    
    switch (subscription.type) {
        case "TranslationFreeze":
            return <span>{t("Translation Freeze for project {{project}}", { project: subscription.projectName })}</span>
    }
}

export function AutoSubscribeEvent({autoSubscribeEvent}: {
    autoSubscribeEvent: AutoSubscription
}) {
    const {t} = useTranslation();
    
    switch (autoSubscribeEvent.type) {
        case "TranslationSubmit":
            return <span>{t("Submit translations")}</span>
    }
}

export enum NotificationChannelType {
    Name
}

export function notificationChannelText(channel: SubscriptionChannelName, type: NotificationChannelType) {
    const data: Record<SubscriptionChannelName, [string]> = {
        "TranslationFreeze": ["SUBSCRIPTION_CHANNEL_NAME_TRANSLATION_FREEZE"]
    }

    return data[channel][type];
}

export function NotificationChannel({channel, type}: {
    channel: SubscriptionChannelName
    type: NotificationChannelType
}) {
    const {t} = useTranslation();
    
    return t(notificationChannelText(channel, type))
}

export enum AutoSubscriptionEventType {
    Name,
    PresentTenseAction
}

export function AutoSubscriptionEvent({event, type}: {
    event: AutoSubscriptionEventName,
    type: AutoSubscriptionEventType
}) {

    const {t} = useTranslation();

    const data: Record<AutoSubscriptionEventName, [string, string]> = {
        "TranslationSubmit": ["AUTO_SUBSCRIPTION_EVENT_NAME_TRANSLATION_SUBMIT", "AUTO_SUBSCRIPTION_EVENT_PRESENT_TENSE_ACTION_TRANSLATION_SUBMIT"]
    }

    return t(data[event][type]);
}