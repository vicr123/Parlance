const PLACEHOLDER_TRANSLATION_STRING = "EDITOR_PLACEHOLDER";
const NUMERIC_PLACEHOLDER_TRANSLATION_STRING = "EDITOR_NUMERIC_PLACEHOLDER";

interface PreviewSettings {
    pluralExample: string;
}

interface PlaceholderDefinition {
    name: string;
    regex: RegExp;
    type: "placeholder";
    preview?: (settings: PreviewSettings) => string;
}

export default {
    qt: [
        {
            name: PLACEHOLDER_TRANSLATION_STRING,
            regex: /%\d/gim,
            type: "placeholder",
        },
        {
            name: NUMERIC_PLACEHOLDER_TRANSLATION_STRING,
            regex: /%n/gim,
            type: "placeholder",
            preview: ({ pluralExample }: PreviewSettings) => pluralExample,
        },
    ],
    i18next: [
        {
            name: PLACEHOLDER_TRANSLATION_STRING,
            regex: /\{\{(?!count}})(.+?)}}/g,
            type: "placeholder",
        },
        {
            name: PLACEHOLDER_TRANSLATION_STRING,
            regex: /<.+?>/g,
            type: "placeholder",
        },
        {
            name: NUMERIC_PLACEHOLDER_TRANSLATION_STRING,
            regex: /{{count}}/g,
            type: "placeholder",
            preview: ({ pluralExample }: PreviewSettings) => pluralExample,
        },
    ],
    resx: [
        {
            name: PLACEHOLDER_TRANSLATION_STRING,
            regex: /\{(\d+?)}/g,
            type: "placeholder",
        },
    ],
    "vue-i18n": [
        {
            name: PLACEHOLDER_TRANSLATION_STRING,
            regex: /\{(?!count})(.+?)}/g,
            type: "placeholder",
        },
        {
            name: NUMERIC_PLACEHOLDER_TRANSLATION_STRING,
            regex: /{count}/g,
            type: "placeholder",
            preview: ({ pluralExample }: PreviewSettings) => pluralExample,
        },
    ],
    "minecraft-fabric": [
        {
            name: PLACEHOLDER_TRANSLATION_STRING,
            regex: /%[abcdefghnostx]/g,
            type: "placeholder",
        },
    ],
    gettext: [
        {
            name: PLACEHOLDER_TRANSLATION_STRING,
            regex: /%s|%r/g,
            type: "placeholder",
        },
        {
            name: NUMERIC_PLACEHOLDER_TRANSLATION_STRING,
            regex: /%d/gim,
            type: "placeholder",
            preview: ({ pluralExample }: PreviewSettings) => pluralExample,
        },
    ],
    "cntp-rs": [
        {
            name: PLACEHOLDER_TRANSLATION_STRING,
            regex: /\{\{(?!count}})(.+?)}}/g,
            type: "placeholder",
        },
        {
            name: NUMERIC_PLACEHOLDER_TRANSLATION_STRING,
            regex: /{{count}}/g,
            type: "placeholder",
            preview: ({ pluralExample }: PreviewSettings) => pluralExample,
        },
    ],
} as Record<string, PlaceholderDefinition[]>;
