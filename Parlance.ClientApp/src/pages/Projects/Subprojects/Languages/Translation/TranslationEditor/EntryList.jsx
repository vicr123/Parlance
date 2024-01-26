import Styles from "./EntryList.module.css";
import {useNavigate, useParams} from "react-router-dom";
import {useForceUpdate} from "../../../../../../helpers/Hooks";
import {checkTranslation, mostSevereType} from "../../../../../../checks";
import BackButton from "../../../../../../components/BackButton";
import {useTranslation} from "react-i18next";
import useTranslationEntries from "./EntryUtils";
import {Fragment, useEffect, useRef} from "react";
import {isEmptyTranslation} from "./EntryHelper";

function EntryListItem({
                           entries,
                           entry,
                           updateManager,
                           translationDirection,
                           translationFileType,
                           searchParams
                       }) {
    const {project, subproject, language, key} = useParams();
    const {goToEntry} = useTranslationEntries(entries, searchParams, translationFileType);
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
    if (!updateManager.isPending(entry.key) && isEmptyTranslation(entry)) {
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
        <div className={Styles.entrySource} dir={"ltr"}>{entry.source}</div>
        <div dir={translationDirection}
             className={Styles.entryTranslation}>{entry.translation[0]?.translationContent}</div>
    </div>
}

export default function EntryList({
                                      entries, translationDirection, updateManager, translationFileType,
                                      searchParams,
                                      setSearchParam
                                  }) {
    const {key} = useParams();
    const {t} = useTranslation();
    const forceUpdate = useForceUpdate();
    const navigate = useNavigate();
    const {filteredEntries} = useTranslationEntries(entries, searchParams, translationFileType);

    updateManager.on("keyStateChanged", forceUpdate);

    const contexts = filteredEntries.reduce((prev, current) => {
        if (!prev[current.context]) prev[current.context] = [];
        prev[current.context].push(current);
        return prev;
    }, {});

    return <div className={Styles.rootList}>
        <div className={`${Styles.scrim} ${key && Styles.haveKey}`}/>
        <BackButton text={t("QUIT")} onClick={() => navigate("..")} inTranslationView={true}/>
        <input type={"text"} className={Styles.searchBox} placeholder={t("SEARCH")} value={searchParams.query}
               onChange={e => setSearchParam("query", e.target.value)}/>
        <div className={Styles.shownTypesSelectContainer}>
            <svg className={Styles.filterIcon}
                 height="16"
                 width="16"
                 version="1.1"
                 id="svg5"
                 xmlns="http://www.w3.org/2000/svg">
                <path
                    className={Styles.filterPath}
                    d="m 1.5,1.5 5,5 v 4 l 3,3 v -7 l 5,-5 z"
                    id="path4486"/>
            </svg>

            <select className={Styles.shownTypesSelect} value={searchParams.filter}
                    onChange={e => setSearchParam("filter", e.target.value)}>
                <option value={"all"}>{t("FILTER_ALL_STRINGS")}</option>
                <option value={"unfinished"}>{t("FILTER_UNFINISHED_STRINGS")}</option>
                <option value={"alerts"}>{t("FILTER_ALERT_STRINGS")}</option>
            </select>

            <svg
                className={Styles.selectDownArrow}
                height="16"
                width="16"
                id="svg2"
                version="1.1">
                <path
                    className={Styles.selectDownArrowPath}
                    d="M 1.4999999,4.7500108 14.5,4.7500108 8.0000003,11.25001 Z"
                    id="path4137"/>
            </svg>

        </div>
        <div className={Styles.entriesContainer}>
            {Object.keys(contexts).map((context, idx) => <Fragment key={idx}>
                <div className={Styles.categoryHeader}>{context}</div>
                {contexts[context].map((entry, idx) => <EntryListItem entries={entries} entry={entry} key={idx}
                                                                      updateManager={updateManager}
                                                                      translationFileType={translationFileType}
                                                                      translationDirection={translationDirection}
                                                                      searchParams={searchParams}
                />)}
            </Fragment>)}
        </div>
    </div>
}