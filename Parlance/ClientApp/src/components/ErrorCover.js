import Styles from "./ErrorCover.module.css";
import {useTranslation} from "react-i18next";
import SilentInformation from "./SilentInformation";
import {useEffect, useState} from "react";

export default function ErrorCover({error, children}) {
    const {t} = useTranslation();
    const [customError, setCustomError] = useState({});

    useEffect(() => {
        (async () => {
            if (error?.jsonBody) {
                switch (error.jsonBody.error) {
                    case "ParlanceJsonFileParseError":
                        setCustomError({
                            title: t("ERROR_PARLANCE_JSON_FILE_PARSE_TITLE"),
                            text: t("ERROR_PARLANCE_JSON_FILE_PARSE_TEXT")
                        })
                        return;
                    case "InvalidBaseFile":
                        setCustomError({
                            title: t("ERROR_INVALID_BASE_FILE_TITLE"),
                            text: t("ERROR_INVALID_BASE_FILE_TEXT")
                        })
                        return;
                }
            }
        })();
    }, [error])

    const title = customError?.title ?? t("ERROR");
    const text = customError?.text ?? t("ERROR_PROMPT");

    return <div className={Styles.cover}>
        <div className={Styles.child}>
            {children}
        </div>
        {error &&
            <SilentInformation className={Styles.error} title={title} text={text}/>
        }
    </div>
}