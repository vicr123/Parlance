import {useTranslation} from "react-i18next";
import ListPageBlock from "@/components/ListPageBlock";
import {VerticalLayout} from "@/components/Layouts";
import PageHeading from "@/components/PageHeading";
import React from "react";

export function AutomaticSubscriptions() {
    const {t} = useTranslation();

    return <div>
        <ListPageBlock>
            <VerticalLayout>
                <PageHeading level={3}>{t("Automatic Subscriptions")}</PageHeading>
                <span>{t("When you perform certain events, Parlance can automatically subscribe you to related notifications.")}</span>
            </VerticalLayout>
        </ListPageBlock>
    </div>
}