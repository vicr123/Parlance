import i18n from 'i18next';
import HttpBackend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import {initReactI18next} from "react-i18next";
import Pseudo from "i18next-pseudo";

let instance = i18n.use(HttpBackend);

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

export default i18n;