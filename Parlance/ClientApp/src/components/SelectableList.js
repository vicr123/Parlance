import Styles from "./SelectableList.module.css"
import React, {useEffect, useState} from "react";
import Fetch from "../helpers/Fetch";
import i18n from "../helpers/i18n";
import {VerticalLayout} from "./Layouts";
import LineEdit from "./LineEdit";
import {useTranslation} from "react-i18next";

export default function SelectableList(props) {
    if (props.children) {
        return <div className={Styles.listContainer}>
            <div className={Styles.listItem} onClick={props.onClick}>{props.children}</div>
        </div>
    } else {
        if (!props.items?.length) return null;

        return <div className={Styles.listContainer}>
            {props.items.map((item, index) => {
                if (typeof (item) === "string") {
                    return <div className={Styles.listSection}>{item}</div>
                } else {
                    return <div className={Styles.listItem} key={index} onClick={item.onClick}>{item.contents}</div>
                }
            })}
        </div>
    }
}

SelectableList.Locales = function Locales({locales, onLocaleSelected}) {
    const [query, setQuery] = useState("");
    const [availableLocales, setAvailableLocales] = useState([]);
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
        <LineEdit placeholder={t("Search")} value={query} onChange={(e) => setQuery(e.target.value)}/>
        <SelectableList items={items}/>
    </VerticalLayout>
}

SelectableList.PreloadingBlock = function ({className, children}) {
    return <div className={`${className} ${Styles.preloadingBlock}`}>
        {children}
    </div>
}

SelectableList.PreloadingText = function (num = 3) {
    let arr = [];
    for (let i = 0; i < num; i++) {
        arr.push({
            contents: <SelectableList.PreloadingBlock>Text</SelectableList.PreloadingBlock>
        });
    }
    return arr;
};
