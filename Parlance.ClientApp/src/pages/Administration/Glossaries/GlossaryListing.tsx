import ListPageBlock from "@/components/ListPageBlock";
import {VerticalLayout} from "@/components/Layouts";
import PageHeading from "@/components/PageHeading";
import SelectableList from "@/components/SelectableList";
import {useTranslation} from "react-i18next";
import {ReactElement, useEffect, useState} from "react";
import Fetch from "@/helpers/Fetch";
import {Glossary} from "@/interfaces/glossary";
import Modal from "@/components/Modal";
import LineEdit from "@/components/LineEdit";
import LoadingModal from "@/components/modals/LoadingModal";

import Styles from "./GlossaryListing.module.css";

interface AddGlossaryModalProps {
    onDone: () => {}
}

interface RemoveGlossaryModalProps {
    onDone: () => {}
    glossary: Glossary
}

function AddGlossaryModal({onDone} : AddGlossaryModalProps) : ReactElement {
    const [glossaryName, setGlossaryName] = useState<string>("");
    const {t} = useTranslation();
    
    const addGlossary = async () => {
        try {
            Modal.mount(<LoadingModal />)
            await Fetch.post("/api/glossarymanager", {
                name: glossaryName
            })
            Modal.unmount();
            onDone();
        } catch (err) {
            Modal.mount(<Modal buttons={[Modal.OkButton]}>
                {t("ADD_GLOSSARY_ERROR")}
            </Modal>)
        }
    }
    
    return <Modal heading={t("ADD_GLOSSARY")} buttons={[
        Modal.CancelButton,
        {
            text: t("GLOSSARY_ADD"),
            onClick: addGlossary
        }
    ]}>
        {t('GLOSSARY_ADD_PROMPT')}
        <LineEdit placeholder={t('GLOSSARY_ADD_GLOSSARY_NAME')} value={glossaryName}
                  onChange={e => setGlossaryName((e.target as HTMLInputElement).value)}/>
    </Modal>
}
function RemoveGlossaryModal({onDone, glossary} : RemoveGlossaryModalProps) : ReactElement {
    const {t} = useTranslation();

    const addGlossary = async () => {
        try {
            Modal.mount(<LoadingModal />)
            await Fetch.delete(`/api/glossarymanager/${glossary.id}`)
            Modal.unmount();
            onDone();
        } catch (err) {
            Modal.mount(<Modal buttons={[Modal.OkButton]}>
                {t("GLOSSARY_REMOVE_ERROR")}
            </Modal>)
        }
    }

    return <Modal heading={t("GLOSSARY_REMOVE")} buttons={[
        Modal.CancelButton,
        {
            text: t("GLOSSARY_REMOVE"),
            onClick: addGlossary,
            destructive: true
        }
    ]}>
        {t('GLOSSARY_REMOVE_PROMPT', {
            glossary: glossary.name
        })}
    </Modal>
}

export default function GlossaryListing() : ReactElement {
    const [glossaries, setGlossaries] = useState<Glossary[]>([]);
    const {t} = useTranslation();
    
    const updateGlossaries = async () => {
        let glossaries = await Fetch.get<Glossary[]>("/api/glossarymanager");
        setGlossaries(glossaries);
    }
    
    const addGlossary = () => {
        Modal.mount(<AddGlossaryModal onDone={updateGlossaries} />)
    }
    
    const removeGlossary = (glossary: Glossary) => {
        Modal.mount(<RemoveGlossaryModal onDone={updateGlossaries} glossary={glossary} />);
    }
    
    useEffect(() => {
        updateGlossaries();
    }, []);
    
    return <div>
        <ListPageBlock>
            <VerticalLayout>
                <PageHeading level={3}>{t("GLOSSARIES")}</PageHeading>
                <span>{t("GLOSSARY_LISTING_PROMPT")}</span>
                <SelectableList items={glossaries.map(glossary => ({
                    contents: <div className={Styles.glossaryItem}>
                        <span>{glossary.name}</span>
                        <span className={Styles.glossaryItemSubtext}>{t("ADD_GLOSSARY_PROJECTS_CONNECTED", {
                            count: glossary.usedByProjects
                        })}</span>
                    </div>,
                    onClick: () => removeGlossary(glossary)
                }))} />
                <SelectableList onClick={addGlossary}>{t("ADD_GLOSSARY")}</SelectableList>
                <span>{t("ADD_GLOSSARY_CONNECT_PROJECT_PROMPT")}</span>
            </VerticalLayout>
        </ListPageBlock>
    </div>
}