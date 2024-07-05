function isEmptyTranslation(entry) {
    return (
        entry.translation.every(entry => entry.translationContent === "") ||
        entry.oldSourceString
    );
}

export { isEmptyTranslation };
