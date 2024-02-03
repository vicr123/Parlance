import {useTranslation} from "react-i18next";
import ListPageBlock from "@/components/ListPageBlock";
import {VerticalLayout} from "@/components/Layouts";
import PageHeading from "@/components/PageHeading";
import React from "react";
import SelectableList from "@/components/SelectableList";
import {UnsubscribeEvent} from "@/components/unsubscribe/UnsubscribeEvent";

export function AutomaticSubscriptions() {
    const {t} = useTranslation();

    return <div>
        <ListPageBlock>
            <VerticalLayout>
                <PageHeading level={3}>{t("Automatic Subscriptions")}</PageHeading>
                <span>{t("When you perform certain events, Parlance can automatically subscribe you to related notifications.")}</span>
                <SelectableList items={[
                    t("When I submit a translation"),
                    {
                        contents: t("Subscribe me to Translation Freezes for the project"),
                        on: true
                    }
                ]} />
            </VerticalLayout>
        </ListPageBlock>
    </div>
}