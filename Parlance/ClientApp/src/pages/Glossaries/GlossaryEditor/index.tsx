import BackButton from "components/BackButton";
import {useNavigate, useParams} from "react-router-dom";
import {useTranslation} from "react-i18next";

import Styles from "./index.module.css"
import GlossaryLanguageSelector from "./GlossaryLanguageSelector";
import GlossaryTable from "./GlossaryTable";
import {useEffect, useState} from "react";
import {GlossaryItem} from "../../../interfaces/glossary";
import Spinner from "../../../components/Spinner";
import Fetch from "../../../helpers/Fetch";

export default function GlossaryEditor() {
    const navigate = useNavigate();
    const {t} = useTranslation();
    const {glossary} = useParams();
    const [glossaryData, setGlossaryData] = useState<GlossaryItem[]>([]);
    const [done, setDone] = useState<boolean>(false);
    
    const updateGlossary = async () => {
        setGlossaryData(await Fetch.get(`/api/GlossaryManager/${glossary}`));
        setDone(true);
    }
    
    useEffect(() => {
        updateGlossary();
    }, [])
    
    if (!done) {
        return <Spinner.Container/>
    }
    
    return <div className={Styles.root}>
        <GlossaryLanguageSelector className={Styles.language} glossaryData={glossaryData} />
        <GlossaryTable className={Styles.table} />
    </div>
}