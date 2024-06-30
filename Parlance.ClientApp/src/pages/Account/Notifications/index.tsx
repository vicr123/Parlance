import BackButton from "@/components/BackButton";
import Container from "@/components/Container";
import {useNavigate} from "react-router-dom";
import {useTranslation} from "react-i18next";
import ListPage from "@/components/ListPage";
import {GeneralNotificationSettings} from "@/pages/Account/Notifications/General";
import {AutomaticSubscriptions} from "@/pages/Account/Notifications/AutomaticSubscriptions";
import {useEffect, useReducer, useState} from "react";
import Spinner from "@/components/Spinner";
import {SubscriptionChannelName} from "@/interfaces/unsubscribe";
import Fetch from "@/helpers/Fetch";
import {notificationChannelText, NotificationChannelType} from "@/components/notifications/Events";
import {Channel, ChannelSubscriptionsActions, ChannelSubscriptionState} from "@/pages/Account/Notifications/Channel";

export function NotificationsSettings() {
    const [ready, setReady] = useState(false);
    const {t} = useTranslation();
    const navigate = useNavigate();

    const [channels, dispatchChannels] = useReducer((state: ChannelSubscriptionState[], action: ChannelSubscriptionsActions) => {
        switch (action.action) {
            case "init":
                return action.data;
            case "set":
                return state.map(item => {
                    if (item.channel == action.channel && item.subscriptionData == action.subscriptionData) {
                        item.enabled = action.enabled;
                    }
                    return item;
                });
        }
    }, [])

    const updateChannelSubscriptionState = async () => {
        const response = await Fetch.get<ChannelSubscriptionState[]>("/api/notifications/channels");
        dispatchChannels({
            action: "init",
            data: response
        });
        setReady(true);
    }

    useEffect(() => {
        void updateChannelSubscriptionState();
    }, []);

    if (!ready) {
        return <div>
            <BackButton onClick={() => navigate("..")}/>
            <Spinner.Container/>
        </div>
    }

    const groups = Object.groupBy(channels, subscription => subscription.channel);

    return <div>
        <BackButton onClick={() => navigate("..")}/>
        
        <ListPage items={[
            t("NOTIFICATIONS"),
            {
                slug: "general",
                name: t("GENERAL"),
                render: <GeneralNotificationSettings />,
                default: true
            },
            {
                slug: "automatic-subscriptions",
                name: t("AUTO_SUBSCRIPTION_SETTINGS_TITLE"),
                render: <AutomaticSubscriptions />
            },
            t("NOTIFICATIONS_CHANNELS"),
            ...Object.keys(groups).map(groupString => {
                const group = groupString as SubscriptionChannelName;
                
                return {
                    slug: group,
                    name: t(notificationChannelText(group, NotificationChannelType.Name)),
                    render: <Channel channel={group} channels={channels} dispatchChannels={dispatchChannels} />
                };
            })
        ]} />
    </div>
}

