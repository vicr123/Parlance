import "i18next";
import translations from "../../public/resources/translations/en/translation.json";

declare module "i18next" {
    // Extend CustomTypeOptions
    interface CustomTypeOptions {
        defaultNS: "translation";
        resources: {
            translation: typeof translations;
        };
    }
}