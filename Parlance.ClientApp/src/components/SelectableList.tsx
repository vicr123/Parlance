import Styles from "./SelectableList.module.css";
import React, { ReactElement, ReactNode, useEffect, useState } from "react";
import Fetch from "../helpers/Fetch";
import i18n from "../helpers/i18n";
import { VerticalLayout } from "./Layouts";
import LineEdit from "./LineEdit";
import { useTranslation } from "react-i18next";
import PreloadingBlock from "./PreloadingBlock";

interface SelectableListItemObject {
    onClick?: () => void;
    contents: ReactNode;
    containerClass?: string;
    on?: boolean;
    type?: "destructive";
}

export type SelectableListItem = SelectableListItemObject | string;

interface SelectableListOneItemProps {
    children?: React.ReactElement;
    onClick?: () => void;
    on?: boolean;
}

interface SelectableListMultiItemProps {
    items?: (SelectableListItem | undefined)[];
}

type SelectableListProps =
    | SelectableListOneItemProps
    | SelectableListMultiItemProps;

interface SelectableListLocaleProps {
    locales?: string[];
    onLocaleSelected: (locale: string) => void;
}

function SelectableListItem({ item }: { item: SelectableListItemObject }) {
    const { t } = useTranslation();

    return (
        <div
            className={`${Styles.listItem} ${item.containerClass}`}
            onClick={item.onClick}
        >
            <div className={Styles.listItemContents}>{item.contents}</div>
            {item.on !== undefined && (
                <div className={Styles.listItemOnState}>
                    {item.on ? t("On") : t("Off")}
                </div>
            )}
        </div>
    );
}

export default function SelectableList(
    props: SelectableListProps,
): ReactElement | null {
    if ("children" in props && props.children) {
        const { children, onClick, on } = props;
        return (
            <div className={Styles.listContainer}>
                <SelectableListItem
                    item={{
                        contents: children,
                        onClick: onClick,
                        on: on,
                    }}
                />
            </div>
        );
    } else if ("items" in props) {
        const { items } = props;
        if (!items?.length) return null;

        return (
            <div className={Styles.listContainer}>
                {items
                    .filter(item => item)
                    .map((item, index) => {
                        if (typeof item === "string") {
                            return (
                                <div className={Styles.listSection} key={index}>
                                    {item}
                                </div>
                            );
                        } else {
                            return (
                                <SelectableListItem item={item!} key={index} />
                            );
                        }
                    })}
            </div>
        );
    }
    return null;
}

SelectableList.Locales = function Locales({
    locales,
    onLocaleSelected,
}: SelectableListLocaleProps): ReactElement {
    const [query, setQuery] = useState("");
    const [availableLocales, setAvailableLocales] = useState<string[]>([]);
    const { t } = useTranslation();

    useEffect(() => {
        (async () => {
            if (locales) {
                setAvailableLocales(locales);
            } else {
                setAvailableLocales(await Fetch.get("/api/cldr"));
            }
        })();
    }, [locales]);

    const items = availableLocales
        .map(locale => ({
            contents: i18n.humanReadableLocale(locale),
            onClick: () => onLocaleSelected(locale),
            locale,
        }))
        .filter(
            x =>
                query === "" ||
                x.locale.toLowerCase().includes(query.toLowerCase()) ||
                x.contents.toLowerCase().includes(query.toLowerCase()),
        )
        .sort((a, b) =>
            new Intl.Collator(i18n.language).compare(a.contents, b.contents),
        );

    return (
        <VerticalLayout>
            <LineEdit
                placeholder={t("Search")}
                value={query}
                onChange={e => setQuery((e.target as HTMLInputElement).value)}
            />
            <SelectableList items={items} />
        </VerticalLayout>
    );
};

SelectableList.PreloadingText = function (num = 3) {
    let arr: {
        contents: ReactNode;
    }[] = [];
    for (let i = 0; i < num; i++) {
        arr.push({
            contents: <PreloadingBlock>Text</PreloadingBlock>,
        });
    }
    return arr;
};
