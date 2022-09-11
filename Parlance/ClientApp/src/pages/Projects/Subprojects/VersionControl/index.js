import {useParams} from "react-router-dom";
import {useTranslation} from "react-i18next";
import Container from "../../../../components/Container";
import PageHeading from "../../../../components/PageHeading";
import React, {useEffect, useState} from "react";
import SelectableList from "../../../../components/SelectableList";
import Fetch from "../../../../helpers/Fetch";
import Styles from "./index.module.css";
import SmallButton from "../../../../components/SmallButton";
import Modal from "../../../../components/Modal";
import LoadingModal from "../../../../components/modals/LoadingModal";
import ErrorModal from "../../../../components/modals/ErrorModal";

function Commit({commit}) {
    return <div className={Styles.commitContainer}>
        <span className={Styles.commitMessage}>{commit.commitMessage.split("\n")[0]}</span>
        <code className={Styles.commitIdentifier}>{commit.commitIdentifier.substring(0, 7)}</code>
    </div>
}

export default function VersionControl() {
    const [vcsState, setVcsState] = useState();
    const {project} = useParams();
    const {t} = useTranslation();

    const updateVcs = async () => {
        setVcsState(await Fetch.get(`/api/Projects/${project}/vcs`));
    };

    useEffect(() => {
        updateVcs();
    }, []);

    if (!vcsState) {
        return <div>

        </div>
    }

    return <div>
        <Container>
            <PageHeading level={3}>{t("Git")}</PageHeading>
            <div className={Styles.infoGrid}>
                <span>{t("Last Local Commit")}</span>
                <Commit commit={vcsState.latestLocalCommit}/>
                <div className={Styles.border}/>

                <span>{t("Last Remote Commit")}</span>
                <Commit commit={vcsState.latestRemoteCommit}/>
                <div className={Styles.border}/>

                <span>{t("Incoming Commits")}</span>
                <div className={Styles.buttonBox}>
                    <SmallButton>{t("Pull {{count}} commits", {count: vcsState.behind})}</SmallButton>
                </div>
                <div className={Styles.border}/>

                <span>{t("Uncommitted Changes")}</span>
                <div className={Styles.buttonBox}>
                    <SmallButton>{t("Commit {{count}} files", {count: vcsState.changedFiles.length})}</SmallButton>
                </div>
                <div className={Styles.border}/>

                <span>{t("Outgoing Commits")}</span>
                <div className={Styles.buttonBox}>
                    <SmallButton>{t("Push {{count}} commits", {count: vcsState.ahead})}</SmallButton>
                </div>
                <div className={Styles.border}/>
            </div>
        </Container>
        <Container>
            <PageHeading level={3}>{t("ACTIONS")}</PageHeading>
            <SelectableList items={[
                {
                    contents: t("Fetch"),
                    onClick: async () => {
                        Modal.mount(<LoadingModal/>);
                        try {
                            await Fetch.post(`/api/projects/${project}/vcs/fetch`, {});
                            await updateVcs();
                            Modal.unmount();
                        } catch (err) {
                            Modal.mount(<ErrorModal error={err}/>);
                        }
                    }
                },
                {
                    contents: t("Pull"),
                    onClick: () => {

                    }
                },
                {
                    contents: t("Commit"),
                    onClick: () => {

                    }
                },
                {
                    contents: t("Push"),
                    onClick: () => {

                    }
                }
            ]}/>
        </Container>
    </div>
}