import {useNavigate, useParams} from "react-router-dom";
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
import {VerticalLayout, VerticalSpacer} from "../../../../components/Layouts";
import BackButton from "../../../../components/BackButton";
import PreloadingBlock from "../../../../components/PreloadingBlock";

function Commit({commit}) {
    if (!commit) {
        return <div className={Styles.commitContainer}>
            <PreloadingBlock>COMMIT MESSAGE PLACEHOLDER ITEMS</PreloadingBlock>
            <PreloadingBlock width={"auto"}><code>0000000</code></PreloadingBlock>
        </div>
    }

    return <div className={Styles.commitContainer}>
        <span className={Styles.commitMessage}>{commit.commitMessage.split("\n")[0]}</span>
        <code className={Styles.commitIdentifier}>{commit.commitIdentifier.substring(0, 7)}</code>
    </div>
}

export default function VersionControl() {
    const [vcsState, setVcsState] = useState();
    const {project} = useParams();
    const {t} = useTranslation();
    const navigate = useNavigate();

    const cloneUrl = `${window.location.protocol}//${window.location.host}/git/${project}/`;

    const updateVcs = async () => {
        setVcsState(await Fetch.get(`/api/Projects/${project}/vcs`));
    };

    useEffect(() => {
        updateVcs();
    }, []);

    const fetch = async () => {
        Modal.mount(<LoadingModal/>);
        try {
            await Fetch.post(`/api/projects/${project}/vcs/fetch`, {});
            await updateVcs();
            Modal.unmount();
        } catch (err) {
            Modal.mount(<ErrorModal error={err}/>);
        }
    }

    const pull = async () => {
        Modal.mount(<LoadingModal/>);

        try {
            await Fetch.post(`/api/projects/${project}/vcs/pull`);
            await updateVcs();
            Modal.unmount();
        } catch (err) {
            Modal.mount(<ErrorModal error={err} specialRenderings={{
                "DirtyWorkingTree": <Modal buttons={[
                    Modal.CancelButton,
                    {
                        text: t("VCS_DISCARD_UNCOMMITTED_CHANGES"),
                        onClick: discardUncommittedChanges,
                        destructive: true
                    },
                    {
                        text: t("VCS_CREATE_COMMIT"),
                        onClick: commit
                    }
                ]}>
                    <VerticalLayout>
                        <span>{t("ERROR_DIRTY_WORKING_TREE")}</span>
                    </VerticalLayout>
                </Modal>,
                "MergeConflict": <Modal heading={t("Merge Conflict")} buttons={[Modal.OkButton]}>
                    <VerticalLayout>
                        <span>{t("translation:ERROR_MERGE_CONFLICT")}</span>
                        <VerticalSpacer height={20}/>
                        <PageHeading level={3}>{t("Reconciling Changes")}</PageHeading>
                        <span>{t("In order to reconcile the repository, merge the Parlance repository locally by adding the below remote and merging it:")}</span>
                        <code>{cloneUrl}</code>
                    </VerticalLayout>
                </Modal>
            }}/>)
        }
    }

    const push = async () => {
        Modal.mount(<LoadingModal/>);

        try {
            await Fetch.post(`/api/projects/${project}/vcs/push`);
            await updateVcs();
            Modal.unmount();
        } catch (err) {
            Modal.mount(<ErrorModal error={err} specialRenderings={{
                "NonFastForwardableError": <Modal buttons={[
                    Modal.CancelButton,
                    {
                        text: t("VCS_PULL"),
                        onClick: pull
                    }
                ]}>
                    <VerticalLayout>
                        <span>{t("ERROR_NON_FAST_FORWARDABLE")}</span>
                    </VerticalLayout>
                </Modal>
            }}/>)
        }
    }

    const commit = () => {
        if (vcsState.changedFiles.length === 0) {
            Modal.mount(<Modal heading={t("VCS_NOTHING_TO_COMMIT")} buttons={[Modal.OkButton]}>
                <VerticalLayout>
                    <span>{t("VCS_NOTHING_TO_COMMIT_PROMPT")}</span>
                </VerticalLayout>
            </Modal>);
            return;
        }

        Modal.mount(<Modal heading={t("VCS_COMMIT")} buttons={[
            Modal.CancelButton,
            {
                text: t("VCS_CREATE_COMMIT"),
                onClick: async () => {
                    Modal.mount(<LoadingModal/>);

                    try {
                        let commit = await Fetch.post(`/api/projects/${project}/vcs/commit`);
                        await updateVcs();
                        Modal.mount(<Modal heading={t("VCS_CREATED_COMMIT")} buttons={[
                            {
                                text: t("DONE"),
                                onClick: () => Modal.unmount()
                            },
                            {
                                text: t("VCS_PUSH"),
                                onClick: push
                            }
                        ]}>
                            <VerticalLayout>
                                <span>{t("VCS_CREATED_COMMIT_PROMPT")}</span>
                                <Commit commit={commit}/>
                            </VerticalLayout>
                        </Modal>)
                    } catch (err) {
                        Modal.mount(<ErrorModal error={err}/>)
                    }
                }
            }
        ]}>
            <VerticalLayout>
                <span>{t("VCS_COMMIT_PROMPT", {count: vcsState.changedFiles.length})}</span>
                <VerticalLayout>
                    {vcsState.changedFiles.map(file => <span key={file}
                                                             className={Styles.commitFileChange}>{file}</span>)}
                </VerticalLayout>
            </VerticalLayout>
        </Modal>)
    }

    const discardUncommittedChanges = () => {
        Modal.mount(<Modal heading={t("VCS_DISCARD_UNCOMMITTED_CHANGES")} buttons={[
            Modal.CancelButton,
            {
                text: t("VCS_DISCARD"),
                onClick: async () => {
                    Modal.mount(<LoadingModal />);
                    try {
                        await Fetch.delete(`/api/projects/${project}/vcs/uncommitted`);
                        await updateVcs();
                        Modal.unmount();
                    } catch (err) {
                        Modal.mount(<ErrorModal error={err} />)
                    }
                },
                destructive: true
            }
        ]}>
            <VerticalLayout>
                <span>{t("VCS_DISCARD_UNCOMMITTED_CHANGES_PROMPT", { count: vcsState.changedFiles.length })}</span>
                <VerticalLayout>
                    {vcsState.changedFiles.map(file => <span key={file}
                        className={Styles.commitFileChange}>{file}</span>)}
                </VerticalLayout>
            </VerticalLayout>
        </Modal>)
    }

    const copyCloneUrl = () => {
        navigator.clipboard.writeText(cloneUrl);
    }

    return <div>
        <BackButton text={t("BACK_TO_SUBPROJECTS")} onClick={() => navigate("..")}/>
        <VerticalSpacer/>
        <Container>
            <PageHeading level={3}>{t("VCS_GIT")}</PageHeading>
            <div className={Styles.infoGrid}>
                <span>{t("VCS_LAST_LOCAL_COMMIT")}</span>
                <div className={Styles.commitAligner}>
                    <Commit commit={vcsState?.latestLocalCommit}/>
                </div>
                <div className={Styles.border}/>

                <span>{t("VCS_LAST_REMOTE_COMMIT")}</span>
                <div className={Styles.buttonBox}>
                    <Commit commit={vcsState?.latestRemoteCommit}/>
                    <SmallButton onClick={fetch}>{t("VCS_FETCH")}</SmallButton>
                </div>
                <div className={Styles.border}/>

                <span>{t("VCS_INCOMING_COMMITS")}</span>
                <div className={Styles.buttonBox}>
                    <SmallButton
                        onClick={pull}>{t("VCS_INCOMING_COMMITS_PULL", {count: vcsState?.behind || 0})}</SmallButton>
                </div>
                <div className={Styles.border}/>

                <span>{t("VCS_UNCOMMITTED_CHANGES")}</span>
                <div className={Styles.buttonBox}>
                    <SmallButton
                        onClick={commit}>{t("VCS_UNCOMMITTED_CHANGES_COMMIT", {count: vcsState?.changedFiles.length || 0})}</SmallButton>
                </div>
                <div className={Styles.border}/>

                <span>{t("VCS_OUTGOING_COMMITS")}</span>
                <div className={Styles.buttonBox}>
                    <SmallButton
                        onClick={push}>{t("VCS_OUTGOING_COMMITS_PUSH", {count: vcsState?.ahead || 0})}</SmallButton>
                </div>
                <div className={Styles.border}/>

                <span>{t("Clone URL")}</span>
                <div className={Styles.buttonBox}>
                    <code>{cloneUrl}</code>
                    <SmallButton onClick={copyCloneUrl}>{t("Copy")}</SmallButton>
                </div>
                <div className={Styles.border}/>
            </div>
        </Container>
        <Container>
            <PageHeading level={3}>{t("ACTIONS")}</PageHeading>
            <SelectableList items={[
                {
                    contents: t("VCS_FETCH"),
                    onClick: fetch
                },
                {
                    contents: t("VCS_PULL"),
                    onClick: pull
                },
                {
                    contents: t("VCS_COMMIT"),
                    onClick: commit
                },
                {
                    contents: t("VCS_PUSH"),
                    onClick: push
                },
                {
                    contents: t("VCS_DISCARD_UNCOMMITTED_CHANGES"),
                    onClick: discardUncommittedChanges
                }
            ]}/>
        </Container>
    </div>
}