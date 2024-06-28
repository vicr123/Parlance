import Container from "@/components/Container";
import PageHeading from "@/components/PageHeading";
import SelectableList from "@/components/SelectableList";
import React, {useEffect, useMemo, useState} from "react";
import {Trans, useTranslation} from "react-i18next";
import {VerticalSpacer} from "@/components/Layouts";
import {Subscription, UnsubscribeInformation} from "@/interfaces/unsubscribe";
import Fetch from "@/helpers/Fetch";
import Spinner from "@/components/Spinner";
import Modal from "@/components/Modal";
import LoadingModal from "@/components/modals/LoadingModal";
import {useNavigate} from "react-router-dom";
import ModalList from "@/components/ModalList";
import {AutoSubscribeEvent, UnsubscribeEvent} from "@/components/notifications/Events";

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

            Modal.mount(<Modal heading={t("UNSUBSCRIBE")} buttons={[
                {
                    text: t("NOTIFICATION_SETTINGS"),
                    onClick: () => {
                        Modal.unmount();
                        navigate("/account/notifications")
                    }
                }
            ]}>
                {t("UNSUBSCRIBE_SUCCESS")}
            </Modal>)
        } catch (ex) {
            Modal.mount(<Modal heading={t("UNSUBSCRIBE_ERROR_HEADING")} buttons={[Modal.OkButton]}>
                {t("UNSUBSCRIBE_ERROR_BODY")}
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
        Modal.mount(<Modal heading={t("UNSUBSCRIBE_UNVERIFY_CONFIRM_TITLE")} buttons={[Modal.CancelButton]}>
            {t("UNSUBSCRIBE_UNVERIFY_CONFIRM_BODY")}
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
            <Container>
                <PageHeading level={3}>{t("EMAIL_UNSUBSCRIBE_COMPLETELY_HEADER")}</PageHeading>
                <p>{t("EMAIL_UNSUBSCRIBE_COMPLETELY_DESCRIPTION_1")}</p>
                <p>{t("EMAIL_UNSUBSCRIBE_COMPLETELY_DESCRIPTION_2")}</p>
                <SelectableList onClick={unsubscribeTotally}>{t("EMAIL_UNSUBSCRIBE_COMPLETELY")}</SelectableList>
            </Container>
            <Container>
                <PageHeading level={3}>{t("EMAIL_UNSUBSCRIBE_UNVERIFY_HEADER")}</PageHeading>
                <p>{t("EMAIL_UNSUBSCRIBE_UNVERIFY_DESCRIPTION")}</p>
                <SelectableList onClick={unverifyEmail}>{t("EMAIL_UNVERIFY_BUTTON")}</SelectableList>
            </Container>
        </>}
    </div>
}
