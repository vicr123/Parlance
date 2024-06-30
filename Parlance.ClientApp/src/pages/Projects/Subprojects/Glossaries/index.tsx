import {VerticalLayout, VerticalSpacer} from "../../../../components/Layouts";
import React, {ReactElement, ReactNode, useEffect, useMemo, useState} from "react";
import BackButton from "../../../../components/BackButton";
import {useTranslation} from "react-i18next";
import {useNavigate, useParams} from "react-router-dom";
import PageHeading from "../../../../components/PageHeading";
import Container from "../../../../components/Container";

import Styles from "./index.module.css"
import {Glossary} from "../../../../interfaces/glossary";
import Fetch from "../../../../helpers/Fetch";
import SelectableList from "../../../../components/SelectableList";
import Modal from "../../../../components/Modal";
import ErrorModal from "../../../../components/modals/ErrorModal";
import Icon from "../../../../components/Icon";
import UserManager from "../../../../helpers/UserManager";

interface GlossaryListProps {
    title: string;
    glossaries: Glossary[] | null;
    shiftGlossary: (glossary: Glossary) => void;
    onLeft: boolean;
}

function GlossaryList({glossaries, title, shiftGlossary, onLeft}: GlossaryListProps): ReactElement {
    const {t} = useTranslation();
    
    let list: ReactNode;
    if (glossaries === null) {
        list = <SelectableList items={SelectableList.PreloadingText()} />
    } else if (glossaries.length === 0) {
        list = t("NO_GLOSSARIES")
    } else {
        list = <SelectableList items={glossaries?.map(x => ({
            contents: <div className={Styles.glossaryItem}>
                <span>{x.name}</span>
                <Icon className={Styles.glossaryItemIcon} icon={onLeft ? "go-next" : "go-previous"} flip={true} />
            </div>,
            onClick: () => shiftGlossary(x),
            containerClass: Styles.glossaryItemContainer
        }))} />;
    }
    
    return <div className={`${Styles.listRoot} ${onLeft ? Styles.left : ""}`}>
        <PageHeading className={Styles.listHeading} level={3}>{title}</PageHeading>
        {list}
    </div>
}

function GlossaryManager() : ReactElement {
    const {t} = useTranslation();
    const {project} = useParams();
    const [connectedGlossaries, setConnectedGlossaries] = useState<Glossary[] | null>(null);
    const [disconnectedGlossaries, setDisconnectedGlossaries] = useState<Glossary[] | null>(null);
    const [mobileSwitch, setMobileSwitch] = useState<boolean>(false);
    
    useEffect(() => {
        (async() => {
            let [glossaries, connectedGlossaries] = await Promise.all([
                Fetch.get<Glossary[]>("/api/glossarymanager"),
                Fetch.get<Glossary[]>(`/api/projects/${project}/glossary`)
            ]);
            setConnectedGlossaries(connectedGlossaries);
            setDisconnectedGlossaries(glossaries.filter(x => !connectedGlossaries.some(y => x.id === y.id)));
        })();
    }, []);
    
    const connectGlossary = async (glossary: Glossary) => {
        setConnectedGlossaries([...connectedGlossaries as Glossary[], glossary]);
        
        let disconnected = [...disconnectedGlossaries as Glossary[]];
        disconnected.splice(disconnectedGlossaries!.findIndex(x => x.id == glossary.id), 1);
        setDisconnectedGlossaries(disconnected)
        
        try {
            await Fetch.post(`/api/projects/${project}/glossary`, {
                glossaryId: glossary.id
            })
        } catch (e) {
            Modal.mount(<ErrorModal error={e} onContinue={() => window.location.reload()} okButtonText={t("RELOAD")} />)
        }
    }
    
    const disconnectGlossary = async (glossary: Glossary) => {
        setDisconnectedGlossaries([...disconnectedGlossaries as Glossary[], glossary]);
        
        let connected = [...connectedGlossaries as Glossary[]];
        connected.splice(connectedGlossaries!.findIndex(x => x.id == glossary.id), 1);
        setConnectedGlossaries(connected);
        
        try {
            await Fetch.delete(`/api/projects/${project}/glossary/${glossary.id}`)
        } catch (e) {
            Modal.mount(<ErrorModal error={e} onContinue={() => window.location.reload()} okButtonText={t("RELOAD")} />)
        }
    }
    
    return <>
        <div className={`${Styles.glossaryManagerRootContainer} ${mobileSwitch && Styles.mobileSwitch}`}>
            <div className={Styles.glossaryManagerRoot}>
                <VerticalLayout className={Styles.glossaryManagerSide}>
                    <GlossaryList title={t("CONNECTED_GLOSSARIES")} glossaries={connectedGlossaries} shiftGlossary={disconnectGlossary} onLeft={true} />
                    <div className={Styles.mobileSwitcher}>
                        <SelectableList onClick={() => setMobileSwitch(true)}>
                            {t("MANAGE_GLOSSARIES_MOBILE_SHIFT_1")}
                        </SelectableList>
                    </div>
                </VerticalLayout>
                <VerticalLayout className={Styles.glossaryManagerSide}>
                    <GlossaryList title={t("AVAILABLE_GLOSSARIES")} glossaries={disconnectedGlossaries} shiftGlossary={connectGlossary} onLeft={false} />
                    <div className={Styles.mobileSwitcher}>
                        <SelectableList onClick={() => setMobileSwitch(false)}>
                            {t("MANAGE_GLOSSARIES_MOBILE_SHIFT_2")}
                        </SelectableList>
                    </div>
                </VerticalLayout>
            </div>
        </div>
    </>
}

export default function Glossaries() : ReactElement {
    const {t} = useTranslation();
    const navigate = useNavigate();
    
    return <div>
        <BackButton text={t("BACK_TO_SUBPROJECTS")} onClick={() => navigate("..")}/>
        <Container>
            <VerticalLayout>
                <PageHeading level={3}>{t("MANAGE_GLOSSARIES")}</PageHeading>
                <span>{t("MANAGE_GLOSSARIES_PROMPT_1")}</span>
                <br />
                <span>{t("MANAGE_GLOSSARIES_PROMPT_2")}</span>
            </VerticalLayout>
        </Container>
        <GlossaryManager />
    </div>
}