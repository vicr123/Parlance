const PLACEHOLDER_TRANSLATION_STRING = "EDITOR_PLACEHOLDER";
const NUMERIC_PLACEHOLDER_TRANSLATION_STRING = "EDITOR_NUMERIC_PLACEHOLDER";

export default {
    qt: [
        {
            name: PLACEHOLDER_TRANSLATION_STRING,
            regex: /%\d/gim,
            type: "placeholder"
        },
        {
            name: NUMERIC_PLACEHOLDER_TRANSLATION_STRING,
            regex: /%n/gim,
            type: "placeholder",
            preview: ({pluralExample}) => pluralExample
        }
    ],
    i18next: [
        {
            name: PLACEHOLDER_TRANSLATION_STRING,
            regex: /\{\{(?!count}})(.+)}}/g,
            type: "placeholder"
        },
        {
            name: PLACEHOLDER_TRANSLATION_STRING,
            regex: /<.+?>/g,
            type: "placeholder"
        },
        {
            name: NUMERIC_PLACEHOLDER_TRANSLATION_STRING,
            regex: /{{count}}/g,
            type: "placeholder",
            preview: ({pluralExample}) => pluralExample
        }
    ]
}