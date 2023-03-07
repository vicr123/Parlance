import i18n from 'i18next';
import HttpBackend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import {initReactI18next} from "react-i18next";
import Pseudo from "i18next-pseudo";
import Fetch from "./Fetch";
import moment from "moment/moment";
import 'moment/min/locales'

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
        order: ['querystring', 'localStorage', 'navigator'],
        lookupLocalStorage: "lang"
    },
    postProcess: ['pseudo'],
    returnEmptyString: false
})

instance.on("languageChanged", language => {
    moment.locale(language);
});
instance.on("initialized", options => {
    moment.locale(i18n.resolvedLanguage);
});

i18n.humanReadableLocale = (locale, selectedLanguage = i18n.language) => {
    try {
        let parts = locale.split("-");

        let readableParts = [];
        let language = parts.shift();
        let script = parts.shift();
        let country = parts.shift();

        if (language) readableParts.push((new Intl.DisplayNames([selectedLanguage], {type: "language"})).of(language));

        if (script) {
            //Ensure this is actually a script
            try {
                readableParts.push(`(${(new Intl.DisplayNames([selectedLanguage], {type: "script"})).of(script)})`);
            } catch {
                //Probably a country then
                country = script;
            }
        }

        if (country) readableParts.push(`(${(new Intl.DisplayNames([selectedLanguage], {type: "region"})).of(country)})`);

        return readableParts.join(" ");
    } catch {
        return locale;
    }
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
        if (typeof (promise) !== "promise") {
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

i18n.isRegionAgnostic = locale => {
    return locale.length === 2;
};

const i18ndir = i18n.dir.bind(i18n);
i18n.dir = (lng) => {
    if (!lng) lng = i18n.resolvedLanguage || (i18n.languages && i18n.languages.length > 0 ? i18n.languages[0] : i18n.language);
    if (!lng) return "ltr";
    return i18ndir(lng);
}

export default i18n;