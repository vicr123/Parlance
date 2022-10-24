import Fetch from "../../../../../../../helpers/Fetch";

class MicrosoftEngine {
    #languages;

    constructor() {
    }

    async prepareLanguages() {
        if (this.#languages) return;

        let languages = await Fetch.get("/api/services/microsoft/languages");
        this.#languages = languages.map(x => x.code);
    }

    async findTranslations(source, language) {
        await this.prepareLanguages();

        if (language.includes("_")) language = language.replace("_", "-");
        language = language.toLowerCase();

        let msLang = null;
        if (this.#languages.includes(language)) {
            msLang = language;
        } else {
            msLang = this.#languages.find(x => x.startsWith(language));
        }

        if (!msLang) return [];

        let results = await Fetch.post("/api/services/microsoft/translations", {
            text: source,
            from: "en-us",
            to: msLang
        });

        console.log(results);

        return results.map(x => ({
            type: "microsoft",
            source: x.originalText,
            product: x.product,
            translation: x.translations.find(x => x.language === msLang).translatedText
        })).splice(0, 5);
    }
}

const instance = new MicrosoftEngine();
export default instance;