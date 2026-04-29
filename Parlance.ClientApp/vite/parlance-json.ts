// noinspection JSUnusedGlobalSymbols

/**
 * The root object of the Parlance Definition file. Parlance will look for a
 * file named `.parlance.json` or `.parlance.yaml` in the root of the
 * repository.
 */
export interface ParlanceJson {
    /**
     * The name for this project. For example, "Parlance"
     */
    name: string;

    /**
     * The subprojects to appear underneath this project. Each project should
     * have at least one subproject, otherwise there will be nothing to
     * translate.
     */
    subprojects: ParlaceJsonSubproject[];

    /**
     * The deadline for collecting translations, in UNIX seconds. When present
     * and in the future, Parlance will raise this project in priority and
     * start displaying the deadline.
     *
     * This date may also be called a string freeze.
     */
    deadline?: number;
}

interface ParlanceJsonBaseSubproject {
    /**
     * The name for this subproject
     */
    name: string;

    /**
     * The path, relative to the root of the repository, where translation
     * files can be found.
     *
     * `{lang}` will be replaced with the language code for the translation.
     *
     * @example For a Gettext Portable Object located at `/translations/en_US.po`
     *
     * ```
     * /translations/{lang}.po
     * ```
     */
    path: string;

    /**
     * The base language for the project, where all the source translations
     * are located. Usually English (`en` or `en_US`)
     */
    baseLang: string;

    /**
     * A Markdown string explaining how to enable live updates if they are
     * supported by this project. The string will appear on the Translation
     * screen, allowing the editors to preview their work.
     *
     * @example
     * ```md
     * To enable Live Updates for this subproject,
     *
     * 1. Press CTRL+P
     * 2. Type "translation live update"
     * 3. Select the "Enable Translation Live Updates from Parlance" option
     * ```
     */
    liveUpdateSupportInformation?: string;

    /**
     * True to encourage the use of region agnostic languages (`en`, `pt`)
     * as opposed to region specific (`en_US`, `pt_BR`). False otherwise.
     *
     * @remarks
     * Whether this option is enabled or not, region specific translations
     * can still be created as needed.
     */
    preferRegionAgnosticLanguage?: boolean;
}

type ParlaceJsonSubproject =
    | AppleStringsSubproject
    | ContemporaryRustSubproject
    | DotNetResourcesSubproject
    | GettextSubproject
    | I18nextJsonSubproject
    | QtLinguistSubproject
    | VueI18nSubproject
    | WebExtensionJsonSubproject;

interface AppleStringsSubproject extends ParlanceJsonBaseSubproject {
    /**
     * The type of the translation files.
     * @see {@link path} to specify the path to the translation files.
     */
    type: "apple-strings";
}

interface ContemporaryRustSubproject extends ParlanceJsonBaseSubproject {
    /**
     * The type of the translation files.
     * @see {@link path} to specify the path to the translation files.
     */
    type: "cntp-rs";
}

interface DotNetResourcesSubproject extends ParlanceJsonBaseSubproject {
    /**
     * The type of the translation files.
     * @see {@link path} to specify the path to the translation files.
     */
    type: "resx";
}

interface GettextSubproject extends ParlanceJsonBaseSubproject {
    /**
     * The type of the translation files.
     * @see {@link path} to specify the path to the translation files.
     */
    type: "gettext";

    /**
     * The path to the Gettext Portable Object Template (`.pot`) file.
     */
    basePath: string;
}

interface I18nextJsonSubproject extends ParlanceJsonBaseSubproject {
    /**
     * The type of the translation files.
     * @see {@link path} to specify the path to the translation files.
     */
    type: "i18next" | "cntp-toml" | "minecraft-fabric";

    /**
     * True if the key strings themselves are the source for the translations,
     * false otherwise.
     *
     * Monolingual translation files should be preferred over dual-lingual
     * translation files, as Parlance can track when the strings change
     * for monolingual translation files and provide translators with a diff.
     */
    isDual?: boolean;
}

interface QtLinguistSubproject extends ParlanceJsonBaseSubproject {
    /**
     * The type of the translation files.
     * @see {@link path} to specify the path to the translation files.
     */
    type: "qt";
}

interface VueI18nSubproject extends ParlanceJsonBaseSubproject {
    /**
     * The type of the translation files.
     * @see {@link path} to specify the path to the translation files.
     */
    type: "vue-i18n";
}

interface WebExtensionJsonSubproject extends ParlanceJsonBaseSubproject {
    /**
     * The type of the translation files.
     * @see {@link path} to specify the path to the translation files.
     */
    type: "webext-json";
}
