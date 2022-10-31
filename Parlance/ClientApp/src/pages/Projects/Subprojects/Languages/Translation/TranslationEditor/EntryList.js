import Styles from "./EntryList.module.css";
import {useNavigate, useParams} from "react-router-dom";
import {useForceUpdate} from "../../../../../../helpers/Hooks";
import {checkTranslation, mostSevereType} from "../../../../../../checks";
import BackButton from "../../../../../../components/BackButton";
import {useTranslation} from "react-i18next";
import useTranslationEntries from "./EntryUtils";
import {Fragment, useEffect, useRef} from "react";

function EntryListItem({entries, entry, updateManager, translationDirection, translationFileType}) {
    const {project, subproject, language, key} = useParams();
    const {goToEntry} = useTranslationEntries(entries);
    const ref = useRef();

    const navigateToKey = () => {
        goToEntry(entry.key);
    }

    useEffect(() => {
        if (key === entry.key && ref.current) {
            ref.current.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });
        }
    }, [key])

    const classes = [Styles.entryItem];
    if (entry.key === key) classes.push(Styles.selected);

    const iconClasses = [Styles.entryIcon];
    if (!updateManager.isPending(entry.key) && entry.translation.every(entry => entry.translationContent === "")) {
        iconClasses.push(Styles.iconIncomplete);
    } else {
        if (updateManager.isPending(entry.key)) {
            iconClasses.push(Styles.iconPending);
        } else {
            iconClasses.push(Styles.iconOk);
        }

        let mostSevereCheck = mostSevereType(entry.translation.map(pform => mostSevereType(checkTranslation(entry.source, pform.translationContent, translationFileType))));
        switch (mostSevereCheck) {
            case "error":
                iconClasses.push(Styles.iconErrorAlerts);
                break;
            case "warn":
                iconClasses.push(Styles.iconWarningAlerts);
                break;
            default:
                iconClasses.push(Styles.iconNoAlerts);
                break;
        }
    }

    return <div onClick={navigateToKey} className={classes.join(" ")} key={entry.key} ref={ref}>
        <div className={iconClasses.join(" ")}></div>
        <div className={Styles.entrySource}>{entry.source}</div>
        <div dir={translationDirection}
             className={Styles.entryTranslation}>{entry.translation[0]?.translationContent}</div>
    </div>
}

export default function EntryList({entries, translationDirection, updateManager, translationFileType}) {
    const {key} = useParams();
    const {t} = useTranslation();
    const forceUpdate = useForceUpdate();
    const navigate = useNavigate();

    updateManager.on("keyStateChanged", forceUpdate);

    const contexts = entries.reduce((prev, current) => {
        if (!prev[current.context]) prev[current.context] = [];
        prev[current.context].push(current);
        return prev;
    }, {});

    return <div className={Styles.rootList}>
        <div className={`${Styles.scrim} ${key && Styles.haveKey}`}/>
        <BackButton text={t("QUIT")} onClick={() => navigate("..")} inTranslationView={true}/>
        {Object.keys(contexts).map((context, idx) => <Fragment key={idx}>
            <div className={Styles.categoryHeader}>{context}</div>
            {contexts[context].map((entry, idx) => <EntryListItem entries={entries} entry={entry} key={idx}
                                                                  updateManager={updateManager}
                                                                  translationFileType={translationFileType}
                                                                  translationDirection={translationDirection}/>)}
        </Fragment>)}
    </div>
}