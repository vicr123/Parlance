import {Trans, useTranslation} from "react-i18next";
import ListPageBlock from "@/components/ListPageBlock";
import {VerticalLayout} from "@/components/Layouts";
import PageHeading from "@/components/PageHeading";
import React, {useEffect, useReducer, useState} from "react";
import SelectableList from "@/components/SelectableList";
import Fetch from "@/helpers/Fetch";
import {
    AutoSubscriptionEvent,
    AutoSubscriptionEventType,
    notificationChannelText,
    NotificationChannelType
} from "@/components/notifications/Events";
import {AutoSubscriptionEventName, SubscriptionChannelName} from "@/interfaces/unsubscribe";
import Modal from "@/components/Modal";
import ErrorModal from "@/components/modals/ErrorModal";
import Spinner from "@/components/Spinner";

interface AutoSubscriptionState {
    channel: SubscriptionChannelName;
    event: AutoSubscriptionEventName;
    subscribed: boolean;
}

interface SubscriptionsInitAction {
    action: "init"
    data: AutoSubscriptionState[]
}

interface SubscriptionsSetAction {
    action: "set"
    channel: string
    event: string
    subscribed: boolean
}

type SubscriptionsActions = SubscriptionsInitAction | SubscriptionsSetAction;

export function AutomaticSubscriptions() {
    const [ready, setReady] = useState(false);
    const [subscriptions, dispatchSubscriptions] = useReducer((state: AutoSubscriptionState[], action: SubscriptionsActions) => {
        switch (action.action) {
            case "init":
                return action.data;
            case "set":
                return state.map(item => {
                    if (item.channel == action.channel && item.event == action.event) {
                        item.subscribed = action.subscribed;
                    }
                    return item;
                });
        }
    }, [])
    const {t} = useTranslation();

    const updateAutoSubscriptionsState = async () => {
        const response = await Fetch.get<AutoSubscriptionState[]>("/api/notifications/autosubscriptions");
        dispatchSubscriptions({
            action: "init",
            data: response
        });
        setReady(true);
    }

    useEffect(() => {
        void updateAutoSubscriptionsState();
    }, []);
    
    const setAutoSubscription = async (channel: SubscriptionChannelName, event: AutoSubscriptionEventName, subscribed: boolean) => {
        dispatchSubscriptions({
            action: "set",
            event: event,
            channel: channel,
            subscribed: subscribed
        });

        try {
            await Fetch.post("/api/notifications/autosubscriptions", {
                channel: channel,
                event: event,
                subscribed: subscribed
            });
        } catch (e) {
            Modal.mount(<ErrorModal error={e} onContinue={() => window.location.reload()} okButtonText={t("RELOAD")} />)
        }
    }
    
    if (!ready) {
        return <Spinner.Container />
    }
    
    const groups = Object.groupBy(subscriptions, subscription => subscription.channel);

    return <>
        <ListPageBlock>
            <VerticalLayout>
                <PageHeading level={3}>{t("AUTO_SUBSCRIPTION_SETTINGS_TITLE")}</PageHeading>
                <span>{t("AUTO_SUBSCRIPTION_SETTINGS_DESCRIPTION")}</span>
            </VerticalLayout>
        </ListPageBlock>
        {Object.keys(groups).map(groupString => {
            const group = groupString as SubscriptionChannelName;
            const autoSubscriptions = groups[group];
            
            return <ListPageBlock key={groupString}>
                <VerticalLayout>
                    <SelectableList items={[
                        t(notificationChannelText(group, NotificationChannelType.Name)),
                        ...autoSubscriptions.map(subscription => ({
                            contents: <Trans i18nKey={"AUTO_SUBSCRIPTION_SETTINGS_EVENT"}>
                                When&nbsp;
                                <AutoSubscriptionEvent event={subscription.event}
                                                       type={AutoSubscriptionEventType.PresentTenseAction}/>
                            </Trans>,
                            onClick: () => setAutoSubscription(subscription.channel, subscription.event, !subscription.subscribed),
                            on: subscription.subscribed
                        }))
                    ]} />
                </VerticalLayout>
            </ListPageBlock>;
        })}
    </>
}