import Styles from "./index.module.css";
import {useParams} from "react-router-dom";
import EntryList from "./EntryList";
import TranslationArea from "./TranslationArea";
import ExtrasArea from "./ExtrasArea";
import {useEffect, useState} from "react";
import Fetch from "../../../../../../helpers/Fetch";
import {HotKeys} from "react-hotkeys";
import {useUpdateManager} from "./UpdateManager";

export default function(props) {
    const {project, subproject, language, key} = useParams();
    const [etag, setEtag] = useState();
    const [entries, setEntries] = useState([]);
    const [subprojectData, setSubprojectData] = useState({});
    const updateManager = useUpdateManager();
    
    const translationDirection = (new Intl.Locale(language)).textInfo?.direction || "ltr";
    
    const updateEntries = async () => {
        setEntries(await Fetch.get(`/api/Projects/${project}/${subproject}/${language}/entries`, result => {
            setEtag(result.headers.get("etag"));
        }));
    }
    
    const updateSubproject = async () => {
        setSubprojectData(await Fetch.get(`/api/Projects/${project}/${subproject}`));
    }
    
    useEffect(() => {
        updateEntries();
        updateSubproject();
    }, []);
    
    const pushUpdate = async (key, update) => {
        setEntries(entries => entries.map(entry => {
            if (entry.key !== key) {
                return entry;
            }
            
            entry.translation = update.translationStrings;
            return entry;
        }));
        
        updateManager.queueForUpdate(key, update);
    };
    
    const keymap = {
        NEXT: ["down", "ctrl+enter"],
        BACK: "up"
    };
    
    const handlers = {
        NEXT: () => {
            console.log("NEXT");
        },
        BACK: () => {
            console.log("BACK");
        }
    }
    
    return <HotKeys keyMap={keymap} handlers={handlers}>
        <div className={Styles.root}>
            <EntryList entries={entries} translationDirection={translationDirection} />
            <TranslationArea onPushUpdate={pushUpdate} entries={entries} translationDirection={translationDirection} translationFileType={subprojectData.translationFileType} />
            <ExtrasArea />
        </div>
    </HotKeys>
}