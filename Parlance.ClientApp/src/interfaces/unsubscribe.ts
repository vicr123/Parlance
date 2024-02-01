interface TranslationSubmitEvent {
    type: "translation-submit";
}

export type AutoSubscriptionEvent = TranslationSubmitEvent;

interface BaseSubscription {
    autoSubscription?: AutoSubscriptionEvent;
}

interface TranslationFreezeSubscription extends BaseSubscription {
    type: "translation-freeze";
    project: string;
}

export type Subscription = TranslationFreezeSubscription;
