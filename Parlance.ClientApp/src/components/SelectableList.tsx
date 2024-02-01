import Styles from "./SelectableList.module.css"
import React, {ReactElement, ReactNode, useEffect, useState} from "react";
import Fetch from "../helpers/Fetch";
import i18n from "../helpers/i18n";
import {VerticalLayout} from "./Layouts";
import LineEdit from "./LineEdit";
import {useTranslation} from "react-i18next";
import PreloadingBlock from "./PreloadingBlock";

interface SelectableListItemObject {
    onClick?: () => void
    contents: ReactNode
    containerClass?: string
}

type SelectableListItem = SelectableListItemObject | string;

interface SelectableListProps {
    children?: React.ReactElement
    onClick?: () => void
    items?: (SelectableListItem | undefined)[]
}

interface SelectableListLocaleProps {
    locales: string[];
    onLocaleSelected: (locale: string) => void;
}

export default function SelectableList({children, onClick, items} : SelectableListProps): ReactElement | null {
    if (children) {
        return <div className={Styles.listContainer}>
            <div className={Styles.listItem} onClick={onClick}>{children}</div>
        </div>
    } else {
        if (!items?.length) return null;

        return <div className={Styles.listContainer}>
            {items.filter(item => item).map((item, index) => {
                if (typeof (item) === "string") {
                    return <div className={Styles.listSection}>{item}</div>
                } else {
                    return <div className={`${Styles.listItem} ${item!.containerClass}`} key={index} onClick={item!.onClick}>{item!.contents}</div>
                }
            })}
        </div>
    }
}

SelectableList.Locales = function Locales({locales, onLocaleSelected}: SelectableListLocaleProps): ReactElement {
    const [query, setQuery] = useState("");
    const [availableLocales, setAvailableLocales] = useState<string[]>([]);
    const {t} = useTranslation();

    useEffect(() => {
        (async () => {
            if (locales) {
                setAvailableLocales(locales);
            } else {
                setAvailableLocales(await Fetch.get("/api/cldr"));
            }
        })();
    }, [locales])

    const items = availableLocales.map(locale => ({
        contents: i18n.humanReadableLocale(locale),
        onClick: () => onLocaleSelected(locale),
        locale
    }))
        .filter(x => query === "" || x.locale.toLowerCase().includes(query.toLowerCase()) || x.contents.toLowerCase().includes(query.toLowerCase()))
        .sort((a, b) => new Intl.Collator(i18n.language).compare(a.contents, b.contents))

    return <VerticalLayout>
        <LineEdit placeholder={t("Search")} value={query} onChange={(e) => setQuery((e.target as HTMLInputElement).value)}/>
        <SelectableList items={items}/>
    </VerticalLayout>
}

SelectableList.PreloadingText = function (num = 3) {
    let arr: {
        contents: ReactNode
    }[] = [];
    for (let i = 0; i < num; i++) {
        arr.push({
            contents: <PreloadingBlock>Text</PreloadingBlock>
        });
    }
    return arr;
};
