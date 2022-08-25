import Styles from "./EntryList.module.css";
import {useNavigate, useParams} from "react-router-dom";

export default function({entries, translationDirection}) {
    const {project, subproject, language, key} = useParams();
    const navigate = useNavigate();
    
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
                
                return <div onClick={navigateToKey} className={classes.join(" ")}>
                    <div className={Styles.entryIcon}></div>
                    <div className={Styles.entrySource}>{entry.source}</div>
                    <div dir={translationDirection} className={Styles.entryTranslation}>{entry.translation[0]?.translationContent}</div>
                </div>
            })}
        </>)}
    </div>
}