import {VerticalLayout, VerticalSpacer} from "../../../../components/Layouts";
import React, {ReactElement, useEffect, useState} from "react";
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

interface GlossaryListProps {
    title: string;
    glossaries: Glossary[] | null;
    shiftGlossary: (glossary: Glossary) => void;
}

function GlossaryList({glossaries, title, shiftGlossary}: GlossaryListProps): ReactElement {
    const {t} = useTranslation();
    
    return <div>
        <PageHeading level={3}>{title}</PageHeading>
        {glossaries?.length ? <SelectableList items={glossaries?.map(x => ({
            contents: x.name,
            onClick: () => shiftGlossary(x)
        }))} /> : t("No glossaries")}
    </div>
}

function GlossaryManager() : ReactElement {
    const {t} = useTranslation();
    const {project} = useParams();
    const [connectedGlossaries, setConnectedGlossaries] = useState<Glossary[] | null>(null);
    const [disconnectedGlossaries, setDisconnectedGlossaries] = useState<Glossary[] | null>(null);
    
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
    
    return <div className={Styles.glossaryManagerRoot}>
        <GlossaryList title={t("Connected Glossaries")} glossaries={connectedGlossaries} shiftGlossary={disconnectGlossary} />
        <div></div>
        <GlossaryList title={t("Available Glossaries")} glossaries={disconnectedGlossaries} shiftGlossary={connectGlossary} />
    </div>
}

export default function Glossaries() : ReactElement {
    const {t} = useTranslation();
    const navigate = useNavigate();
    
    return <div>
        <BackButton text={t("BACK_TO_SUBPROJECTS")} onClick={() => navigate("..")}/>
        <VerticalSpacer/>
        <Container>
            <VerticalLayout>
                <PageHeading level={3}>{t("MANAGE_GLOSSARIES")}</PageHeading>
                <span>{t("When translators are using the Glossary feature, only the results from the connected glossaries are shown.")}</span>
                <br />
                <span>{t("To connect or disconnect a glossary to the project, select it from the list.")}</span>
                <VerticalSpacer/>
                <GlossaryManager />
            </VerticalLayout>
        </Container>
    </div>
}