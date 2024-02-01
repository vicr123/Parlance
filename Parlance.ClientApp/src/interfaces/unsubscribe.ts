interface TranslationSubmitEvent {
    type: "TranslationSubmit";
}

export type AutoSubscriptionEvent = TranslationSubmitEvent;

interface BaseSubscription {
    autoSubscription?: AutoSubscriptionEvent;
}

interface TranslationFreezeSubscription extends BaseSubscription {
    type: "TranslationFreeze";
    project: string;
    projectName: string;
}

export type Subscription = TranslationFreezeSubscription;

export interface UnsubscribeInformation {
    emailNotificationsOn: boolean,
    subscription: Subscription
}