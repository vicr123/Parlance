import Container from "@/components/Container";
import PageHeading from "@/components/PageHeading";
import SelectableList from "@/components/SelectableList";
import React, {useEffect, useMemo, useState} from "react";
import {Trans, useTranslation} from "react-i18next";
import {VerticalSpacer} from "@/components/Layouts";
import {AutoSubscribeEvent, UnsubscribeEvent} from "@/components/unsubscribe/UnsubscribeEvent";
import {Subscription, UnsubscribeInformation} from "@/interfaces/unsubscribe";
import Fetch from "@/helpers/Fetch";
import Spinner from "@/components/Spinner";
import Modal from "@/components/Modal";
import LoadingModal from "@/components/modals/LoadingModal";
import UserManager from "@/helpers/UserManager";
import {useNavigate} from "react-router-dom";
import ModalList from "@/components/ModalList";

type UnsubscribeOptions = "UnsubscribeOnly" | "UnsubscribeTerminateAutoSubscription" | "UnsubscribeTotally" | "UnverifyEmail";

export default function EmailUnsubscribe() {
    const {t} = useTranslation();
    const token = useMemo(() => {
        const params = new URLSearchParams(window.location.search);
        return params.get("subscription")!;
    }, []);
    const [subscription, setSubscription] = useState<Subscription | undefined>();
    const [emailNotificationsOn, setEmailNotificationsOn] = useState(false);
    const navigate = useNavigate();

    const updateSubscriptionState = async () => {
        const response = await Fetch.post<UnsubscribeInformation>("/api/emailunsubscribe", {
            token: token
        });
        setSubscription(response.subscription);
        setEmailNotificationsOn(response.emailNotificationsOn);
    }
    
    useEffect(() => {
        void updateSubscriptionState();
    }, []);
    
    if (!subscription) {
        return <div>
            <Spinner.Container />
        </div>
    }

    const unsubscribe = async (type: UnsubscribeOptions) => {
        //Perform the username change
        Modal.mount(<LoadingModal />);
        try {
            await Fetch.post("/api/emailunsubscribe/unsubscribe", {
                token: token,
                unsubscribeOption: type
            });

            Modal.mount(<Modal heading={t("Unsubscribe")} buttons={[
                {
                    text: t("Notification Settings"),
                    onClick: () => {
                        Modal.unmount();
                        navigate("/account/notifications")
                    }
                }
            ]}>
                {t("You have been unsubscribed.")}
            </Modal>)
        } catch (ex) {
            Modal.mount(<Modal heading={t("Could not unsubscribe from the event")} buttons={[Modal.OkButton]}>
                {t("Unable to unsubscribe you from the event.")}
            </Modal>)
        }
    }
    
    const unsubscribeTotally = () => {
        Modal.mount(<Modal heading={t("EMAIL_UNSUBSCRIBE_COMPLETELY_HEADER")} buttons={[Modal.CancelButton]}>
            {t("EMAIL_UNSUBSCRIBE_COMPLETELY_DESCRIPTION_2")}
            <ModalList>
                {[
                    {
                        text: t("EMAIL_UNSUBSCRIBE_COMPLETELY"),
                        type: "destructive",
                        onClick: () => unsubscribe("UnsubscribeTotally")
                    }
                ]}
            </ModalList>
        </Modal>)
    }

    const unverifyEmail = () => {
        Modal.mount(<Modal heading={t("Unverify Email Address")} buttons={[Modal.CancelButton]}>
            {t("Do you want to unverify the email address associated with this account?")}
            <ModalList>
                {[
                    {
                        text: t("EMAIL_UNVERIFY_BUTTON"),
                        type: "destructive",
                        onClick: () => unsubscribe("UnverifyEmail")
                    }
                ]}
            </ModalList>
        </Modal>)
    }
    
    return <div>
        <VerticalSpacer/>
        <Container>
            <PageHeading level={3}>{t("UNSUBSCRIBE")}</PageHeading>
            <p>
                <Trans i18nKey={"EMAIL_UNSUBSCRIBE_DESCRIPTION"}>
                    Unsubscribe from <UnsubscribeEvent subscription={subscription} />?
                </Trans>
            </p>
            <SelectableList items={[
                {
                    contents: subscription.autoSubscription ? t("EMAIL_UNSUBSCRIBE_ONLY") : t("EMAIL_DO_UNSUBSCRIBE"),
                    onClick: () => unsubscribe("UnsubscribeOnly")
                },
                subscription.autoSubscription && {
                    contents: <Trans i18nKey={"EMAIL_UNSUBSCRIBE_AND_STOP_AUTO"}>
                        Unsubscribe me and stop automatically subscribing me when I <AutoSubscribeEvent autoSubscribeEvent={subscription.autoSubscription} />
                    </Trans>,
                    onClick: () => unsubscribe("UnsubscribeTerminateAutoSubscription")
                }
            ]}/>
        </Container>
        {emailNotificationsOn && <>
            <VerticalSpacer/>
            <Container>
                <PageHeading level={3}>{t("EMAIL_UNSUBSCRIBE_COMPLETELY_HEADER")}</PageHeading>
                <p>{t("EMAIL_UNSUBSCRIBE_COMPLETELY_DESCRIPTION_1")}</p>
                <p>{t("EMAIL_UNSUBSCRIBE_COMPLETELY_DESCRIPTION_2")}</p>
                <SelectableList onClick={unsubscribeTotally}>{t("EMAIL_UNSUBSCRIBE_COMPLETELY")}</SelectableList>
            </Container>
            <VerticalSpacer/>
            <Container>
                <PageHeading level={3}>{t("If this is not your email address")}</PageHeading>
                <p>{t("If this is not your email address, you can also unverify the email address for this account. Email notifications will not be sent to this email address until the email address is verified again.")}</p>
                <SelectableList onClick={unverifyEmail}>{t("EMAIL_UNVERIFY_BUTTON")}</SelectableList>
            </Container>
        </>}
    </div>
}
