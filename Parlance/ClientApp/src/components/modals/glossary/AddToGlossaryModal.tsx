import {ReactElement, useId, useState} from "react";
import Modal from "../../Modal";
import {Trans, useTranslation} from "react-i18next";
import {HorizontalLayout, VerticalLayout, VerticalSpacer} from "../../Layouts";
import LineEdit from "../../LineEdit";
import {Glossary, GlossaryItem, PartOfSpeech, PartOfSpeechTranslationString} from "../../../interfaces/glossary";
import SelectableList from "../../SelectableList";

import Styles from "./AddToGlossaryModal.module.css"
import Icon from "../../Icon";
import PageHeading from "../../PageHeading";
import I18n from "../../../helpers/i18n";
import Fetch from "../../../helpers/Fetch";
import ErrorModal from "../ErrorModal";
import ErrorText from "../../ErrorText";

interface AddToGlossaryModalProps {
    initialTerm?: string;
    connectedGlossaries: Glossary[];
    language: string;
    onGlossaryItemAdded: (item: GlossaryItem) => void;
}

export default function AddToGlossaryModal({initialTerm, connectedGlossaries, language, onGlossaryItemAdded}: AddToGlossaryModalProps): ReactElement {
    const [term, setTerm] = useState<string>(initialTerm || "");
    const [pos, setPos] = useState<PartOfSpeech>(PartOfSpeech.Unknown);
    const [translation, setTranslation] = useState<string>("");
    const [addGlossary, setAddGlossary] = useState<Glossary>(connectedGlossaries[0]);
    const [regionAgnostic, setRegionAgnostic] = useState<boolean>(true);
    const [error, setError] = useState<string>();
    const regionAgnosticCheckboxId = useId();
    const {t} = useTranslation();
    
    const selectedLanguage = () => regionAgnostic ? language.substring(0, 2) : language;
    
    const addToGlossary = async () => {
        if (!term) {
            setError(t("ADD_TO_GLOSSARY_ERROR_NO_TERM"));
            return;
        }
        
        if (!translation) {
            setError(t("ADD_TO_GLOSSARY_ERROR_NO_TRANSLATION"));
            return;
        }
        
        try {
            Modal.unmount();
            
            await Fetch.post(`/api/glossarymanager/${addGlossary.id}/${selectedLanguage()}`, {
                term: term,
                translation: translation,
                partOfSpeech: pos
            })

            onGlossaryItemAdded({
                term: term,
                translation: translation,
                partOfSpeech: pos,
                id: "",
                lang: selectedLanguage()
            })
        } catch (e) {
            Modal.mount(<ErrorModal error={e} />)
        }
    };
    
    return <Modal heading={t("ADD_TO_GLOSSARY")} buttons={[
        Modal.CancelButton,
        {
            text: t("ADD_TO_GLOSSARY_CONFIRM", {
                glossary: addGlossary.name,
            }),
            onClick: addToGlossary
        }
    ]}>
        <VerticalLayout>
            <HorizontalLayout>
                <div className={Styles.termBox}>
                    <LineEdit placeholder={t("ADD_TO_GLOSSARY_TERM")} value={term} onChange={e => setTerm((e.target as HTMLInputElement).value)} />
                </div>
                <select value={Number(pos)} onChange={e => setPos(Number((e.target as HTMLSelectElement).value))}>
                    {Object.values(PartOfSpeech).filter(pos => !isNaN(Number(pos))).map(pos => <option value={Number(pos)}>{t(PartOfSpeechTranslationString(pos as PartOfSpeech))}</option>)}
                </select>
            </HorizontalLayout>
            <LineEdit placeholder={t("TRANSLATION_AREA_TITLE", {
                lang: I18n.humanReadableLocale(selectedLanguage())
            })} dir={I18n.dir(selectedLanguage())} value={translation} onChange={e => setTranslation((e.target as HTMLInputElement).value)} />
            {I18n.isRegionAgnostic(language) || <div>
                <input id={regionAgnosticCheckboxId} type={"checkbox"} checked={regionAgnostic} onChange={e => setRegionAgnostic((e.target as HTMLInputElement).checked)} />
                <label htmlFor={regionAgnosticCheckboxId}>{t("REGION_AGNOSTIC")}</label>
            </div>}
            {connectedGlossaries.length > 1 && <>
                <VerticalSpacer />
                <PageHeading level={3}>{t("GLOSSARY")}</PageHeading>
                <SelectableList items={connectedGlossaries.map(glossary => ({
                    contents: <div className={Styles.glossaryItem}>
                        <Icon icon={"dialog-ok"} className={`${Styles.glossaryCheck} ${addGlossary.id === glossary.id && Styles.checked}`} />
                        <span>{glossary.name}</span>
                    </div>,
                    onClick: () => setAddGlossary(glossary)
                }))} />
            </>}
            <ErrorText error={error} />
        </VerticalLayout>
    </Modal>
}
