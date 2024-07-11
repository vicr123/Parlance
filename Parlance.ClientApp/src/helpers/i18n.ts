import i18n from "i18next";
import HttpBackend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import Pseudo from "i18next-pseudo";
import Fetch from "./Fetch";
import moment from "moment/moment";
import "moment/min/locales";
import { TextDirection } from "@/interfaces/misc";

type i18next = typeof i18n;

interface ParlanceI18nExport extends i18next {
    humanReadableLocale: (locale: string, selectedLanguage?: string) => string;
    number: (locale: string, number: number) => string;
    list: (locale: string, items: any[]) => string;
    pluralPatterns: (locale: string) => Promise<PluralCategoryDictionary>;
    isRegionAgnostic: (locale: string) => boolean;
    dir: (lng?: string) => TextDirection;
    t: typeof i18n.t;
}

interface PluralPattern {
    category: string;
    examples: number[];
    index: number;
}

type PluralCategoryDictionary = Record<string, number[]>;

let exportMember = i18n as ParlanceI18nExport;

let instance = i18n.use(HttpBackend);

const pluralPatternsCache: Record<
    string,
    PluralCategoryDictionary | Promise<PluralPattern[]>
> = {};

if (import.meta.env.REACT_APP_USE_PSEUDOTRANSLATION) {
    instance.use(
        new Pseudo({
            enabled: true,
        }),
    );
} else {
    instance.use(LanguageDetector);
}
instance.use(initReactI18next).init({
    fallbackLng: "en",
    debug: true,
    interpolation: {
        escapeValue: false,
    },
    backend: {
        loadPath: "/resources/translations/{{lng}}/{{ns}}.json",
    },
    detection: {
        order: ["querystring", "localStorage", "navigator"],
        lookupLocalStorage: "lang",
    },
    postProcess: ["pseudo"],
    returnEmptyString: false,
});

instance.on("languageChanged", language => {
    moment.locale(language);
});
instance.on("initialized", options => {
    moment.locale(i18n.resolvedLanguage);
});

exportMember.humanReadableLocale = (
    locale,
    selectedLanguage = i18n.language,
) => {
    try {
        let parts = locale.split("-");

        let readableParts = [];
        let language = parts.shift();
        let script = parts.shift();
        let country = parts.shift();

        if (language)
            readableParts.push(
                new Intl.DisplayNames([selectedLanguage], {
                    type: "language",
                }).of(language),
            );

        if (script) {
            //Ensure this is actually a script
            try {
                readableParts.push(
                    `(${new Intl.DisplayNames([selectedLanguage], { type: "script" }).of(script)})`,
                );
            } catch {
                //Probably a country then
                country = script;
            }
        }

        if (country)
            readableParts.push(
                `(${new Intl.DisplayNames([selectedLanguage], { type: "region" }).of(country)})`,
            );

        return readableParts.join(" ");
    } catch {
        return locale;
    }
};

exportMember.number = (locale, number) => {
    return new Intl.NumberFormat(locale).format(number);
};

exportMember.list = (locale, items) => {
    return new Intl.ListFormat(locale, {
        style: "narrow",
        type: "conjunction",
    }).format(items);
};

exportMember.pluralPatterns = async locale => {
    let promise: Promise<PluralPattern[]> | PluralCategoryDictionary;
    if (pluralPatternsCache[locale]) {
        promise = pluralPatternsCache[locale];
        if (!(promise instanceof Promise)) {
            return pluralPatternsCache[locale] as PluralCategoryDictionary;
        }
    } else {
        promise = Fetch.get<PluralPattern[]>(`/api/cldr/${locale}/plurals`);
    }

    pluralPatternsCache[locale] = promise;
    let data: PluralPattern[] = (await promise) as PluralPattern[];
    let categories: PluralCategoryDictionary = {};
    for (let category of data) {
        categories[category.category] = category.examples;
    }

    pluralPatternsCache[locale] = categories;
    return categories;
};

exportMember.isRegionAgnostic = locale => {
    return locale.length === 2;
};

const i18ndir = exportMember.dir.bind(i18n);
exportMember.dir = lng => {
    if (!lng)
        lng =
            i18n.resolvedLanguage ||
            (i18n.languages && i18n.languages.length > 0
                ? i18n.languages[0]
                : i18n.language);
    if (!lng) return "ltr";
    return i18ndir(lng);
};

export default exportMember;
