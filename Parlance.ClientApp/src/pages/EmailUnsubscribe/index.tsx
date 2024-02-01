import Container from "@/components/Container";
import PageHeading from "@/components/PageHeading";
import SelectableList from "@/components/SelectableList";
import React, {useState} from "react";
import {Trans, useTranslation} from "react-i18next";
import {VerticalSpacer} from "@/components/Layouts";
import {AutoSubscribeEvent, UnsubscribeEvent} from "@/components/unsubscribe/UnsubscribeEvent";
import {Subscription} from "@/interfaces/unsubscribe";

export default function EmailUnsubscribe() {
    const {t} = useTranslation();
    const [subscription, setSubscription] = useState<Subscription>({
        type: "translation-freeze",
        project: "theFrisbee",
        autoSubscription: {
            type: "translation-submit"
        }
    });
    
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
                    contents: subscription.autoSubscription ? t("EMAIL_UNSUBSCRIBE_ONLY") : t("EMAIL_DO_UNSUBSCRIBE")
                },
                subscription.autoSubscription && {
                    contents: <Trans i18nKey={"EMAIL_UNSUBSCRIBE_AND_STOP_AUTO"}>
                        Unsubscribe me and stop automatically subscribing me when I <AutoSubscribeEvent autoSubscribeEvent={subscription.autoSubscription} />
                    </Trans>
                }
            ]}/>
        </Container>
        <VerticalSpacer/>
        <Container>
            <PageHeading level={3}>{t("EMAIL_UNSUBSCRIBE_COMPLETELY_HEADER")}</PageHeading>
            <p>{t("EMAIL_UNSUBSCRIBE_COMPLETELY_DESCRIPTION_1")}</p>
            <p>{t("EMAIL_UNSUBSCRIBE_COMPLETELY_DESCRIPTION_2")}</p>
            <SelectableList onClick={() => {
            }}>{t("EMAIL_UNSUBSCRIBE_COMPLETELY")}</SelectableList>
        </Container>
        <VerticalSpacer/>
        <Container>
            <PageHeading level={3}>{t("If this is not your email address")}</PageHeading>
            <p>{t("If this is not your email address, you can also deverify the email address for this account. Email notifications will not be sent to this email address until the email address is verified again.")}</p>
            <SelectableList onClick={() => {
            }}>{t("Deverify this email address")}</SelectableList>
        </Container>
    </div>
}
