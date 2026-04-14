import BackButton from "@/components/BackButton";
import ErrorCover from "@/components/ErrorCover";
import Container from "@/components/Container";
import PageHeading from "@/components/PageHeading";
import Styles from "@/pages/Projects/Subprojects/VersionControl/index.module.css";
import SmallButton from "@/components/SmallButton";
import SelectableList from "@/components/SelectableList";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Fetch from "@/helpers/Fetch";
import { ProjectResponse } from "@/interfaces/projects";
import Modal from "@/components/Modal";
import { VerticalLayout, VerticalSpacer } from "@/components/Layouts";
import LineEdit from "@/components/LineEdit";
import LoadingModal from "@/components/modals/LoadingModal";
import { Commit as CommitType } from "@/interfaces/versionControl";
import ErrorModal from "@/components/modals/ErrorModal";

export function Branches() {
    const { project } = useParams();
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [branchState, setBranchState] = useState<ProjectResponse>();
    const [error, setError] = useState<any>();
    const [done, setDone] = useState(false);

    const updateProjects = async () => {
        try {
            setDone(false);
            setBranchState(
                await Fetch.get<ProjectResponse>(`/api/projects/${project}`),
            );
            setDone(true);
        } catch (err: any) {
            setError(err);
        }
    };

    useEffect(() => {
        updateProjects();
    }, [project]);

    const performAdd = async (newBranch: string) => {
        Modal.mount(<LoadingModal />);

        try {
            await Fetch.post(`/api/projects/${project}/branch`, {
                branch: newBranch,
            });
            await updateProjects();
            Modal.unmount();
        } catch (err) {
            Modal.mount(<ErrorModal error={err} />);
        }
    };

    const add = () => {
        Modal.mount(<BranchAddModal onAdd={performAdd} />);
    };

    if (branchState && branchState.branches.length == 0) {
        const performUpgrade = async () => {
            Modal.mount(<LoadingModal />);

            try {
                await Fetch.post(`/api/projects/${project}/upgrade`, undefined);
                await updateProjects();
                Modal.unmount();
            } catch (err) {
                Modal.mount(<ErrorModal error={err} />);
            }
        };

        const upgrade = () => {
            Modal.mount(
                <Modal
                    heading={t("UPGRADE_PROJECT")}
                    buttons={[
                        Modal.CancelButton,
                        {
                            text: t("UPGRADE_PROJECT"),
                            onClick: performUpgrade,
                            destructive: true,
                        },
                    ]}
                >
                    {t("UPGRADE_PROJECT_CONFIRMATION")}
                </Modal>,
            );
        };

        return (
            <div>
                <BackButton
                    text={t("BACK_TO_SUBPROJECTS")}
                    onClick={() => navigate("..")}
                />
                <ErrorCover error={error}>
                    <Container>
                        <PageHeading level={3}>
                            {t("MANAGE_BRANCHES")}
                        </PageHeading>
                        <span>{t("MANAGE_BRANCHES_UPGRADE_PROMPT")}</span>
                        <SelectableList
                            items={[
                                {
                                    contents: t("UPGRADE_PROJECT"),
                                    onClick: upgrade,
                                },
                            ]}
                        />
                    </Container>
                </ErrorCover>
            </div>
        );
    }

    return (
        <div>
            <BackButton
                text={t("BACK_TO_SUBPROJECTS")}
                onClick={() => navigate("..")}
            />
            <ErrorCover error={error}>
                <Container>
                    <PageHeading level={3}>{t("MANAGE_BRANCHES")}</PageHeading>
                    <span>{t("MANAGE_BRANCHES_PROMPT")}</span>
                    <SelectableList
                        items={
                            branchState?.branches.map(branch => {
                                const performDelete = async () => {
                                    Modal.mount(<LoadingModal />);

                                    try {
                                        await Fetch.delete(
                                            `/api/projects/${branch.systemName}/branch`,
                                        );
                                        if (project == branch.systemName) {
                                            const defaultBranch =
                                                branchState.branches.find(
                                                    branch =>
                                                        branch.defaultBranch,
                                                );
                                            navigate(
                                                `/projects/${defaultBranch!.systemName}/branches`,
                                            );
                                        } else {
                                            await updateProjects();
                                        }
                                        Modal.unmount();
                                    } catch (err) {
                                        Modal.mount(<ErrorModal error={err} />);
                                    }
                                };

                                const deleteBranch = () => {
                                    if (branch.defaultBranch) {
                                        Modal.mount(
                                            <Modal buttons={[Modal.OkButton]}>
                                                {t(
                                                    "BRANCH_DELETE_DEFAULT_PROMPT",
                                                )}
                                            </Modal>,
                                        );
                                        return;
                                    }
                                    Modal.mount(
                                        <Modal
                                            heading={t("BRANCH_DELETE")}
                                            buttons={[
                                                Modal.CancelButton,
                                                {
                                                    text: t("BRANCH_DELETE"),
                                                    onClick: performDelete,
                                                    destructive: true,
                                                },
                                            ]}
                                        >
                                            {t("BRANCH_DELETE_PROMPT", {
                                                branch: branch.name,
                                            })}
                                        </Modal>,
                                    );
                                };

                                return {
                                    contents: branch.name,
                                    onClick: deleteBranch,
                                };
                            }) ?? SelectableList.PreloadingText()
                        }
                    />
                </Container>
            </ErrorCover>
            <Container>
                <PageHeading level={3}>{t("ACTIONS")}</PageHeading>
                <SelectableList
                    items={[
                        {
                            contents: t("MANAGE_BRANCHES_ADD_BRANCH"),
                            onClick: add,
                        },
                    ]}
                />
            </Container>
        </div>
    );
}

function BranchAddModal({ onAdd }: { onAdd: (newBranch: string) => void }) {
    const { t } = useTranslation();
    const [newBranch, setNewBranch] = useState("");

    return (
        <Modal
            heading={t("MANAGE_BRANCHES_ADD_BRANCH")}
            buttons={[
                Modal.CancelButton,
                {
                    text: t("MANAGE_BRANCHES_ADD_BRANCH"),
                    onClick: () => onAdd(newBranch),
                },
            ]}
        >
            <div style={{ display: "flex", flexDirection: "column" }}>
                {t("MANAGE_BRANCHES_ADD_BRANCH_PROMPT")}
                <VerticalSpacer height={3} />
                <LineEdit
                    placeholder={t("BRANCH")}
                    value={newBranch}
                    onChange={e =>
                        setNewBranch((e.target as HTMLInputElement).value)
                    }
                />
            </div>
        </Modal>
    );
}
