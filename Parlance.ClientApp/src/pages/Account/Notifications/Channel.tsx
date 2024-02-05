import {SubscriptionChannelName} from "@/interfaces/unsubscribe";
import ListPageBlock from "@/components/ListPageBlock";
import {VerticalLayout} from "@/components/Layouts";
import PageHeading from "@/components/PageHeading";
import React, {Dispatch} from "react";
import {useTranslation} from "react-i18next";
import {notificationChannelText, NotificationChannelType} from "@/components/notifications/Events";
import SelectableList from "@/components/SelectableList";
import Fetch from "@/helpers/Fetch";
import Modal from "@/components/Modal";
import ErrorModal from "@/components/modals/ErrorModal";


export interface ChannelSubscriptionState {
    channel: SubscriptionChannelName;
    subscriptionData: string;
    enabled: boolean;
}

interface ChannelSubscriptionsInitAction {
    action: "init"
    data: ChannelSubscriptionState[]
}

interface ChannelSubscriptionsSetAction {
    action: "set"
    channel: string
    subscriptionData: string
    enabled: boolean
}

export type ChannelSubscriptionsActions = ChannelSubscriptionsInitAction | ChannelSubscriptionsSetAction;

export function Channel({channel, channels, dispatchChannels}: {
    channel: SubscriptionChannelName,
    channels: ChannelSubscriptionState[],
    dispatchChannels: Dispatch<ChannelSubscriptionsActions>
}) {
    const {t} = useTranslation();
    
    const updateChannel = async (subscriptionData: string, enabled: boolean) => {
        dispatchChannels({
            action: "set",
            channel: channel,
            subscriptionData: subscriptionData,
            enabled: enabled
        });

        try {
            await Fetch.post("/api/notifications/channels", {
                channel: channel,
                subscriptionData: subscriptionData,
                enabled: enabled
            });
        } catch (e) {
            Modal.mount(<ErrorModal error={e} onContinue={() => window.location.reload()} okButtonText={t("RELOAD")} />)
        }
    }
    
    return <div>
        <ListPageBlock>
            <VerticalLayout>
                <PageHeading level={3}>{t(notificationChannelText(channel, NotificationChannelType.Name))}</PageHeading>
                <SelectableList items={channels.filter(x => x.channel == channel).map(x => {
                    return {
                        contents: StateContents(x),
                        on: x.enabled,
                        onClick: () => updateChannel(x.subscriptionData, !x.enabled)
                    }
                })} />
            </VerticalLayout>
        </ListPageBlock>
    </div>
}

function StateContents(subscription: ChannelSubscriptionState) {
    const data = JSON.parse(subscription.subscriptionData);
    
    switch (subscription.channel) {
        case "TranslationFreeze":
            return data.Project;
    }
}
