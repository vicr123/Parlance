import Modal from "../../Modal";
import {useTranslation} from "react-i18next";
import {GlossaryItem, PartOfSpeech, PartOfSpeechTranslationString} from "../../../interfaces/glossary";

import Styles from "./SearchGlossaryModal.module.css"
import {useState} from "react";
import I18n from "../../../helpers/i18n";
import SmallButton from "../../SmallButton";

interface SearchGlossaryModalProps {
    language: string
    glossaryData: GlossaryItem[]
}

interface GlossaryTableProps {
    language: string
    glossaryData: GlossaryItem[];
    searchQuery: string
}

function GlossaryTable({language, glossaryData, searchQuery}: GlossaryTableProps) {
    const {t} = useTranslation();
    
    return <div className={Styles.glossaryTable}>
        <span className={Styles.tableHeader}>{t("Term")}</span>
        <span className={Styles.tableHeader}>{t("Translation")}</span>
        <span></span>
        
        {glossaryData.filter(x => x.term.toLowerCase().includes(searchQuery.toLowerCase())).sort().map(glossaryItem => {
            const onCopy = async () => {
                await navigator.clipboard.writeText(glossaryItem.translation);
                Modal.unmount();
            }
            
            return <>
                <div dir={"ltr"}>
                    <span>{glossaryItem.term}</span>
                    {glossaryItem.partOfSpeech !== PartOfSpeech.Unknown && <span
                        className={Styles.partOfSpeech}>{t(PartOfSpeechTranslationString(glossaryItem.partOfSpeech))}</span>}
                </div>
                <span dir={I18n.dir(language)}>{glossaryItem.translation}</span>
                <div>
                    <SmallButton onClick={onCopy}>{t("Copy")}</SmallButton>
                </div>
            </>;
        })}
    </div>
}

export default function SearchGlossaryModal({language, glossaryData}: SearchGlossaryModalProps) {
    const [searchQuery, setSearchQuery] = useState<string>("");
    const {t} = useTranslation();
    
    return <Modal heading={t("GLOSSARY")} buttons={[
        {
            text: t("CLOSE"),
            onClick: () => Modal.unmount()
        }
    ]} topComponent={<>
        <input type={"text"} className={Styles.searchBox} placeholder={t("SEARCH")} value={searchQuery}
                            onChange={e => setSearchQuery((e.target as HTMLInputElement).value)}/>
        <GlossaryTable language={language} glossaryData={glossaryData} searchQuery={searchQuery} />
    </>} />
}
