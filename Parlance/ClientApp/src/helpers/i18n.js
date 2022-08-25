import i18n from 'i18next';
import HttpBackend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import {initReactI18next} from "react-i18next";
import Pseudo from "i18next-pseudo";
import Fetch from "./Fetch";

let instance = i18n.use(HttpBackend);

const pluralPatternsCache = {};

if (process.env.REACT_APP_USE_PSEUDOTRANSLATION) {
    instance.use(new Pseudo({
        enabled: true
    }))
} else {
    instance.use(LanguageDetector);
}
instance.use(initReactI18next).init({
    fallbackLng: "en",
    debug: true,
    interpolation: {
        escapeValue: false
    },
    backend: {
        loadPath: "/resources/translations/{{lng}}/{{ns}}.json"
    },
    detection: {
        order: ['querystring', 'navigator']
    },
    postProcess: ['pseudo']
})

i18n.humanReadableLocale = (locale) => {
    let parts = locale.split("-");
    
    let readableParts = [];
    let language = parts.shift();
    let country = parts.shift();
    
    if (language) readableParts.push((new Intl.DisplayNames([i18n.language], {type: "language"})).of(language));
    if (country) readableParts.push(`(${(new Intl.DisplayNames([i18n.language], {type: "region"})).of(country)})`);
    
    return readableParts.join(" ");
}

i18n.number = (locale, number) => {
    return (new Intl.NumberFormat(locale)).format(number);
}

i18n.list = (locale, items) => {
    return (new Intl.ListFormat(locale, {
        style: "narrow",
        type: "conjunction"
    })).format(items);
}

i18n.pluralPatterns = async (locale) => {
    let promise;
    if (pluralPatternsCache[locale]) {
        promise = pluralPatternsCache[locale];
        if (typeof(promise) !== "promise") {
            return pluralPatternsCache[locale];
        }
    } else {
        promise = Fetch.get(`/api/cldr/${locale}/plurals`)
    }

    pluralPatternsCache[locale] = promise;
    let data = await promise;
    let categories = {};
    for (let category of data) {
        categories[category.category] = category.examples;
    }
    
    // let rules = new Intl.PluralRules(locale);
    // let categories = {};
    // for (let i = 0; i < 200; i++) {
    //     let cat = rules.select(i);
    //     if (!categories[cat]) categories[cat] = [];
    //     categories[cat].push(i);
    // }
    //
    // // Fix CLDR data???
    // if (locale.toLowerCase() === "pt-br") {
    //     categories["many"] = categories["other"];
    // }
    
    pluralPatternsCache[locale] = categories;
    return categories;
}

export default i18n;