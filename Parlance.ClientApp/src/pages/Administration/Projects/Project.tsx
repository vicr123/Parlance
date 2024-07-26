import BackButton from "../../../components/BackButton";
import ListPageBlock from "../../../components/ListPageBlock";
import { VerticalLayout, VerticalSpacer } from "@/components/Layouts";
import PageHeading from "../../../components/PageHeading";
import SelectableList, {
    SelectableListItem,
} from "../../../components/SelectableList";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Modal from "../../../components/Modal";
import ErrorModal from "../../../components/modals/ErrorModal";
import Fetch from "../../../helpers/Fetch";
import LoadingModal from "../../../components/modals/LoadingModal";
import { useEffect, useState } from "react";
import LineEdit from "../../../components/LineEdit";
import ModalList from "../../../components/ModalList";
import { ProjectResponse } from "@/interfaces/projects";
import { ChangeBranchModal } from "@/pages/Administration/Projects/ChangeBranchModal";

export default function Project() {
    const [projectInfo, setProjectInfo] = useState<ProjectResponse>(
        // @ts-expect-error
        {},
    );
    const [maintainers, setMaintainers] = useState<SelectableListItem[]>([]);
    const [error, setError] = useState<any>();
    const [addingUser, setAddingUser] = useState("");
    const { project } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const updateProjectInfo = async () => {
        const [projectInfo, maintainers] = await Promise.allSettled([
            Fetch.get<ProjectResponse>(`/api/projects/${project}`),
            Fetch.get<string[]>(`/api/projects/${project}/maintainers`),
        ]);

        if (projectInfo.status == "fulfilled") {
            setProjectInfo(projectInfo.value);
            setError(undefined);
        } else {
            setError(projectInfo.reason);
        }

        if (maintainers.status == "fulfilled") {
            setMaintainers(
                maintainers.value.map(x => ({
                    contents: x,
                    onClick: () => {
                        Modal.mount(
                            <Modal
                                heading={t("USER_PERMISSIONS_TITLE", {
                                    user: x,
                                })}
                                buttons={[Modal.CancelButton]}
                            >
                                <span>{t("GENERIC_PROMPT")}</span>
                                <ModalList>
                                    {[
                                        {
                                            text: t(
                                                "PROJECT_MAINTAINER_REMOVE",
                                            ),
                                            type: "destructive",
                                            onClick: async () => {
                                                Modal.mount(<LoadingModal />);
                                                try {
                                                    await Fetch.delete(
                                                        `/api/projects/${project}/maintainers/${encodeURIComponent(x)}`,
                                                    );
                                                    await updateProjectInfo();

                                                    Modal.unmount();
                                                } catch (error) {
                                                    Modal.mount(
                                                        <ErrorModal
                                                            error={error}
                                                        />,
                                                    );
                                                }
                                            },
                                        },
                                    ]}
                                </ModalList>
                            </Modal>,
                        );
                    },
                })),
            );
        }
    };

    useEffect(() => {
        updateProjectInfo();
    }, []);

    const deleteProject = () => {
        Modal.mount(
            <Modal
                heading={t("PROJECT_DELETE")}
                buttons={[
                    Modal.CancelButton,
                    {
                        text: t("PROJECT_DELETE"),
                        destructive: true,
                        onClick: async () => {
                            Modal.mount(<LoadingModal />);
                            try {
                                await Fetch.delete(`/api/projects/${project}`);
                                navigate("..");
                                Modal.unmount();
                            } catch (error) {
                                Modal.mount(<ErrorModal error={error} />);
                            }
                        },
                    },
                ]}
            >
                <VerticalLayout>
                    <span>
                        {t("PROJECT_DELETE_CONFIRM_PROMPT", {
                            project: projectInfo.name,
                        })}
                    </span>
                </VerticalLayout>
            </Modal>,
        );
    };

    const changeBranch = () => {
        Modal.mount(
            <ChangeBranchModal
                initialBranch={
                    projectInfo.versionControlInformation?.branch ?? ""
                }
                onChangeBranch={async branch => {
                    Modal.mount(<LoadingModal />);
                    try {
                        await Fetch.post(`/api/projects/${project}/branch`, {
                            branch: branch,
                        });
                        await updateProjectInfo();
                        Modal.unmount();
                    } catch (error) {
                        Modal.mount(<ErrorModal error={error} />);
                    }
                }}
            />,
        );
    };

    const addMaintainer = async () => {
        if (addingUser === "") return;

        Modal.mount(<LoadingModal />);
        try {
            await Fetch.post(`/api/projects/${project}/maintainers`, {
                name: addingUser,
            });
            await updateProjectInfo();

            setAddingUser("");
            Modal.unmount();
        } catch (error) {
            Modal.mount(<ErrorModal error={error} />);
        }
    };

    return (
        <>
            <BackButton inListPage={true} onClick={() => navigate("..")} />
            {error && (
                <ListPageBlock>
                    <VerticalLayout>
                        <PageHeading level={3}>{t("ERROR")}</PageHeading>
                        <span>
                            {t(
                                "This project has a problem preventing it from loading correctly. Correct the error by checking the .parlance.json file",
                            )}
                        </span>
                    </VerticalLayout>
                </ListPageBlock>
            )}
            <ListPageBlock>
                <VerticalLayout>
                    <PageHeading level={3}>
                        {t("PROJECT_MAINTAINERS")}
                    </PageHeading>
                    <span>{t("PROJECT_MAINTAINERS_PROMPT")}</span>
                    {maintainers.length > 0 && (
                        <>
                            <SelectableList items={maintainers} />
                            <VerticalSpacer />
                        </>
                    )}
                    <span>{t("PROJECT_MAINTAINERS_ADD_PROMPT")}</span>
                    <LineEdit
                        placeholder={t("USERNAME")}
                        value={addingUser}
                        style={{
                            marginBottom: "9px",
                        }}
                        onChange={e =>
                            setAddingUser((e.target as HTMLInputElement).value)
                        }
                    />
                    <SelectableList onClick={addMaintainer}>
                        {t("PROJECT_MAINTAINERS_ADD")}
                    </SelectableList>
                </VerticalLayout>
            </ListPageBlock>
            <ListPageBlock>
                <VerticalLayout>
                    <PageHeading level={3}>
                        {t("PROJECT_SOURCE_REPOSITORY")}
                    </PageHeading>
                    {!error &&
                        `${projectInfo.versionControlInformation?.upstreamUrl ?? ""}@${projectInfo.versionControlInformation?.branch ?? ""}`}
                    <SelectableList onClick={changeBranch}>
                        {t("PROJECT_CHANGE_BRANCH")}
                    </SelectableList>
                </VerticalLayout>
            </ListPageBlock>
            <ListPageBlock>
                <VerticalLayout>
                    <PageHeading level={3}>{t("PROJECT_DELETE")}</PageHeading>
                    <span>
                        {t("PROJECT_DELETE_PROMPT", {
                            project: projectInfo.name,
                        })}
                    </span>
                    <SelectableList onClick={deleteProject}>
                        {t("PROJECT_DELETE")}
                    </SelectableList>
                </VerticalLayout>
            </ListPageBlock>
        </>
    );
}
