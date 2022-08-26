import Styles from "./EntryList.module.css";
import {useNavigate, useParams} from "react-router-dom";
import {useForceUpdate} from "../../../../../../helpers/Hooks";
import {Checks, checkTranslation, mostSevereType} from "../../../../../../checks";

export default function({entries, translationDirection, updateManager, translationFileType}) {
    const {project, subproject, language, key} = useParams();
    const forceUpdate = useForceUpdate();
    const navigate = useNavigate();
    
    updateManager.on("keyStateChanged", forceUpdate);
    
    const contexts = entries.reduce((prev, current) => {
        if (!prev[current.context]) prev[current.context] = [];
        prev[current.context].push(current);
        return prev;
    }, {});

    return <div className={Styles.rootList}>
        {Object.keys(contexts).map(context => <>
            <div className={Styles.categoryHeader}>{context}</div>
            {contexts[context].map(entry => {
                const navigateToKey = () => {
                    navigate(`/projects/${project}/${subproject}/${language}/translate/${entry.key}`, {replace: true});
                }
                
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
                
                return <div onClick={navigateToKey} className={classes.join(" ")}>
                    <div className={iconClasses.join(" ")}></div>
                    <div className={Styles.entrySource}>{entry.source}</div>
                    <div dir={translationDirection} className={Styles.entryTranslation}>{entry.translation[0]?.translationContent}</div>
                </div>
            })}
        </>)}
    </div>
}