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
    ]
}

function checkTranslation(source, translation, checkSuite) {
    if (translation === "") return [];
    
    let suite = Checks[checkSuite];
    if (!suite) return [];
    return suite.flatMap(check => {
        if (typeof(check) === "string") {
            return checkTranslation(source, translation, check);
        } else {
            return check(source, translation);
        }
    }).filter(result => result);
}

export { Checks };
export { checkTranslation };