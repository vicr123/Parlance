import {useParams} from "react-router-dom";
import {VerticalLayout} from "../../../components/Layouts";
import PageHeading from "../../../components/PageHeading";
import {useTranslation} from "react-i18next";
import SilentInformation from "../../../components/SilentInformation";

import Styles from "./GlossaryTable.module.css";

interface GlossaryTableProps {
    className: string
}

interface NoGlossaryViewProps {
    className: string
}

function NoGlossaryView({className}: NoGlossaryViewProps) {
    const {t} = useTranslation();
    
    return <div className={className}>
        <div className={Styles.errorView}>
            <VerticalLayout className={Styles.errorViewInner}>
                <SilentInformation title={t("No Language Selected")} text={t("Select a language to view the glossary entries")} />
            </VerticalLayout>
        </div>
    </div>;
}

export default function GlossaryTable({className}: GlossaryTableProps) {
    const {language} = useParams();
    
    if (!language) {
        return <NoGlossaryView className={className} />
    }
    
    return <div className={className}>
        
    </div>
}