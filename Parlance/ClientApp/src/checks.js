function checkDuplicate(source, translation) {
    if (source === translation) return {
        checkSeverity: "warn",
        message: "Source is equal to translation"
    }
}

function checkLeadingSpace(source, translation) {
    if (translation.trimLeft() !== translation) return {
        checkSeverity: "warn",
        message: "Leading space exists"
    };
}

function checkTrailingSpace(source, translation) {
    if (translation.trimRight() !== translation) return {
        checkSeverity: "warn",
        message: "Trailing space exists"
    };
}

function checkQtPlaceholders(source, translation) {
    return [...source.matchAll(/%(\d)/g)].flatMap(placeholder => {
        let num = placeholder[1];
        if (!translation.includes(`%${num}`)) {
            return {
                checkSeverity: "error",
                message: `Placeholder %${num} not present in translation`
            }
        }
    });
}

function checkQtNumericPlaceholders(source, translation) {
    if (source.includes("%n") && !translation.includes("%n")) return {
        checkSeverity: "error",
        message: "Placeholder %n not present in translation"
    };
}

function checki18nextPlaceholders(source, translation) {
    return [...source.matchAll(/{{(.+?)}}/g)].flatMap(placeholder => {
        let ph = placeholder[1];
        if (!translation.includes(`{{${ph}}}`)) {
            return {
                checkSeverity: "error",
                message: `Placeholder {{${ph}}} not present in translation`
            }
        }
    });
}

function checki18nextHtmlPlaceholders(source, translation) {
    return [...source.matchAll(/<(.+?)>/g)].flatMap(placeholder => {
        let ph = placeholder[1];
        if (!translation.includes(`<${ph}>`)) {
            return {
                checkSeverity: "error",
                message: `Placeholder <${ph}> not present in translation`
            }
        }
    });
}

function checkResxPlaceholders(source, translation) {
    return [...source.matchAll(/\{(\d+?)}/g)].flatMap(placeholder => {
        let ph = placeholder[1];
        if (!translation.includes(`{${ph}}`)) {
            return {
                checkSeverity: "error",
                message: `Placeholder {${ph}} not present in translation`
            }
        }
    });
}

const Checks = {
    "common": [
        checkDuplicate,
        checkLeadingSpace,
        checkTrailingSpace
    ],
    "qt": [
        checkQtPlaceholders,
        checkQtNumericPlaceholders,
        "common"
    ],
    "i18next": [
        checki18nextPlaceholders,
        checki18nextHtmlPlaceholders,
        "common"
    ],
    "resx": [
        checkResxPlaceholders,
        "common"
    ]
}

function checkTranslation(source, translation, checkSuite) {
    if (translation === "") return [];

    let suite = Checks[checkSuite];
    if (!suite) return [];
    return suite.map(check => {
        if (typeof (check) === "string") {
            return checkTranslation(source, translation, check);
        } else {
            return check(source, translation);
        }
    }).flat().filter(result => result);
}

function mostSevereType(checks) {
    let severities = checks.map(check => typeof (check) === "string" ? check : check?.checkSeverity);
    if (severities.includes("error")) return "error";
    if (severities.includes("warn")) return "warn";
    return null;
}

export {Checks};
export {checkTranslation};
export {mostSevereType};