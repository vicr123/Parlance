import { useEffect, useState } from "react";
import userManager from "@/helpers/UserManager";
import { useTranslation } from "react-i18next";
import Styles from "./LoginErrorArea.module.css";

export function LoginErrorArea() {
    const { t } = useTranslation();
    const [lastLoginError, setLastLoginError] = useState(
        userManager.lastLoginError(),
    );

    useEffect(() => {
        const updateLoginError = () => {
            setLastLoginError(userManager.lastLoginError());
        };

        userManager.on("loginErrorChanged", updateLoginError);
        return () => {
            userManager.off("loginErrorChanged", updateLoginError);
        };
    }, []);

    if (!lastLoginError) {
        return null;
    }

    let errorMessage = t("LOGIN_ERROR_GENERIC");
    switch (lastLoginError) {
        case "NoAccount":
            errorMessage = t("LOGIN_ERROR_NO_ACCOUNT");
            break;
        case "Failed":
            errorMessage = t("LOGIN_ERROR_FAILED");
            break;
        case "RateLimited":
            errorMessage = t("LOGIN_ERROR_RATE_LIMITED");
            break;
    }

    return <span className={Styles.error}>{errorMessage}</span>;
}
