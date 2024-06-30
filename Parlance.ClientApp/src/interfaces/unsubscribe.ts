export type SubscriptionChannelName = "TranslationFreeze";

export type AutoSubscriptionEventName = "TranslationSubmit";

interface TranslationSubmitEvent {
    type: "TranslationSubmit";
}

export type AutoSubscription = TranslationSubmitEvent;

interface BaseSubscription {
    autoSubscription?: AutoSubscription;
}

interface TranslationFreezeSubscription extends BaseSubscription {
    type: "TranslationFreeze";
    project: string;
    projectName: string;
}

export type Subscription = TranslationFreezeSubscription;

export interface UnsubscribeInformation {
    emailNotificationsOn: boolean;
    subscription: Subscription;
}
