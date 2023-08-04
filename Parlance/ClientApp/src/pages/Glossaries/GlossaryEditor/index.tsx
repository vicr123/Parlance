import BackButton from "components/BackButton";
import {useNavigate} from "react-router-dom";
import {useTranslation} from "react-i18next";

import Styles from "./index.module.css"
import GlossaryLanguageSelector from "./GlossaryLanguageSelector";
import GlossaryTable from "./GlossaryTable";

export default function Index() {
    const navigate = useNavigate();
    const {t} = useTranslation();
    
    return <div className={Styles.root}>
        <GlossaryLanguageSelector className={Styles.language} />
        <GlossaryTable className={Styles.table} />
    </div>
}