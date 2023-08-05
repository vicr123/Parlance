import {useNavigate, useParams} from "react-router-dom";
import {VerticalLayout} from "../../../components/Layouts";
import PageHeading from "../../../components/PageHeading";
import {useTranslation} from "react-i18next";
import SilentInformation from "../../../components/SilentInformation";

import Styles from "./GlossaryTable.module.css";
import GlossaryLookup from "../../Projects/Subprojects/Languages/Translation/TranslationEditor/GlossaryLookup";
import {Glossary, GlossaryItem, PartOfSpeechTranslationString} from "../../../interfaces/glossary";
import SmallButton from "../../../components/SmallButton";
import Icon from "../../../components/Icon";
import Modal from "../../../components/Modal";
import AddToGlossaryModal from "../../../components/modals/glossary/AddToGlossaryModal";
import Fetch from "../../../helpers/Fetch";
import ErrorModal from "../../../components/modals/ErrorModal";
import React, {useState} from "react";
import BackButton from "../../../components/BackButton";

interface GlossaryTableProps {
    className: string
    glossaryData: GlossaryItem[]
    onGlossaryItemAdded: (item: GlossaryItem) => void;
    onGlossaryItemDeleted: (item: GlossaryItem) => void;
    glossaryObject: Glossary;
    canTranslate: boolean;
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

export default function GlossaryTable({className, glossaryData, onGlossaryItemAdded, onGlossaryItemDeleted, glossaryObject, canTranslate}: GlossaryTableProps) {
    const {t} = useTranslation();
    const navigate = useNavigate();
    const {glossary, language} = useParams();
    const [searchQuery, setSearchQuery] = useState<string>("");
    
    if (!language) {
        return <NoGlossaryView className={className} />
    }
    
    const glossaryItems = glossaryData.filter(item => item.lang == language);
    
    const onAdd = () => {
        Modal.mount(<AddToGlossaryModal language={language} connectedGlossaries={[glossaryObject]} onGlossaryItemAdded={onGlossaryItemAdded} />);
    }
    
    const onDelete = async (item: GlossaryItem) => {
        onGlossaryItemDeleted(item);
        
        try {
            await Fetch.delete(`/api/GlossaryManager/${glossary}/${language}/${item.id}`);
        } catch (e) {
            Modal.mount(<ErrorModal error={e} onContinue={() => window.location.reload()} okButtonText={t("RELOAD")} />)
        }
    }
    
    const visibleGlossaryItems = searchQuery ? glossaryItems.filter(x => x.term.toLowerCase().includes(searchQuery.toLowerCase())) : glossaryItems
    
    return <div className={className}>
        <BackButton className={Styles.backButton} text={t("BACK_TO_LANGUAGES")} onClick={() => navigate(`../${glossary}`)} inTranslationView={true} />
        <div className={Styles.searchContainer}>
            <input type={"text"} className={Styles.searchBox} placeholder={t("SEARCH")} value={searchQuery}
                   onChange={e => setSearchQuery((e.target as HTMLInputElement).value)}/>
        </div>
        <div className={Styles.glossaryTable}>
            {visibleGlossaryItems.map(match => <div key={match.id} className={Styles.match}>
                <span className={Styles.term}>{match.term}</span>
                {match.translation && <span className={Styles.pos}>{t(PartOfSpeechTranslationString(match.partOfSpeech))}</span>}
                <span className={Styles.translation}>{match.translation || "?"}</span>
                <span className={Styles.buttons}>
                    {canTranslate && <SmallButton onClick={() => onDelete(match)}>{t("DELETE")}</SmallButton>}
                    </span>
            </div>)}
            {canTranslate && <div className={Styles.addButton} onClick={onAdd}>
                <Icon icon={"list-add"} />
                {t("ADD_TO_GLOSSARY")}
            </div>}
        </div>
    </div>
}