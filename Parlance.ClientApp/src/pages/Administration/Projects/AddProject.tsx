import ListPageBlock from "../../../components/ListPageBlock";
import PageHeading from "../../../components/PageHeading";
import { Trans, useTranslation } from "react-i18next";
import BackButton from "../../../components/BackButton";
import { useNavigate } from "react-router-dom";
import { VerticalLayout } from "@/components/Layouts";
import { useState } from "react";
import SelectableList from "../../../components/SelectableList";
import LineEdit from "../../../components/LineEdit";
import Fetch from "../../../helpers/Fetch";
import LoadingModal from "../../../components/modals/LoadingModal";
import Modal from "../../../components/Modal";

export default function () {
    const [projectName, setProjectName] = useState("");
    const [cloneUrl, setCloneUrl] = useState("");
    const [branch, setBranch] = useState("main");
    const navigate = useNavigate();
    const { t } = useTranslation();

    const addProject = async () => {
        Modal.mount(<LoadingModal />);

        try {
            await Fetch.post("/api/projects", {
                cloneUrl: cloneUrl,
                name: projectName,
                branch: branch,
            });
            Modal.unmount();
            navigate("..");
        } catch (exception) {
            const ex = exception as WebFetchResponse;
            let message = t("ADD_PROJECT_ERROR_PROMPT");
            if (ex.status === 400) {
                message = (await ex.json()).extraData;
            }
            Modal.mount(
                <Modal
                    heading={t("ADD_PROJECT_ERROR")}
                    buttons={[Modal.OkButton]}
                >
                    {message}
                </Modal>,
            );
        }
    };

    return (
        <>
            <BackButton inListPage={true} onClick={() => navigate("..")} />
            <ListPageBlock>
                <VerticalLayout>
                    <PageHeading level={3}>{t("ADD_PROJECT")}</PageHeading>
                    <span>{t("ADD_PROJECT_PROMPT_1")}</span>
                    <LineEdit
                        value={projectName}
                        onChange={e =>
                            setProjectName((e.target as HTMLInputElement).value)
                        }
                        placeholder={t("PROJECT_NAME")}
                    />
                    <LineEdit
                        value={cloneUrl}
                        onChange={e =>
                            setCloneUrl((e.target as HTMLInputElement).value)
                        }
                        placeholder={t("GIT_CLONE_URL")}
                    />
                    <LineEdit
                        value={branch}
                        onChange={e =>
                            setBranch((e.target as HTMLInputElement).value)
                        }
                        placeholder={t("BRANCH")}
                    />
                    <span>
                        <Trans i18nKey={"ADD_PROJECT_PROMPT_2"} t={t}>
                            Ensure that the project contains a{" "}
                            <code>.parlance.json</code> file in the root.
                        </Trans>
                    </span>
                    <SelectableList onClick={addProject}>
                        {t("ADD_PROJECT")}
                    </SelectableList>
                </VerticalLayout>
            </ListPageBlock>
        </>
    );
}
