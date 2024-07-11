type CheckSeverity = "error" | "warn";

interface CheckResult {
    checkSeverity: CheckSeverity;
    message: string;
}

export function checkTranslation(
    source: string,
    translation: string,
    checkSuite: string,
): CheckResult[];

export function mostSevereType(
    checks: (CheckSeverity | CheckResult)[],
): CheckSeverity;
