import BackButton from "@/components/BackButton";
import Container from "@/components/Container";
import {VerticalLayout, VerticalSpacer} from "@/components/Layouts";
import PageHeading from "@/components/PageHeading";
import LineEdit from "@/components/LineEdit";
import SelectableList from "@/components/SelectableList";
import {useNavigate} from "react-router-dom";
import {useTranslation} from "react-i18next";
import ListPage from "@/components/ListPage";
import {GeneralNotificationSettings} from "@/pages/Account/Notifications/General";
import {AutomaticSubscriptions} from "@/pages/Account/Notifications/AutomaticSubscriptions";

export function NotificationsSettings() {
    const {t} = useTranslation();
    const navigate = useNavigate();
    
    return <div>
        <BackButton onClick={() => navigate("..")}/>
        <Container>
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
                t("NOTIFICATIONS_CHANNELS")
            ]} />
        </Container>
    </div>
}