import BackButton from "../../../components/BackButton";
import ListPageBlock from "../../../components/ListPageBlock";
import {VerticalLayout, VerticalSpacer} from "../../../components/Layouts";
import PageHeading from "../../../components/PageHeading";
import SelectableList from "../../../components/SelectableList";
import {useNavigate, useParams} from "react-router-dom";
import {useTranslation} from "react-i18next";
import Modal from "../../../components/Modal";
import ErrorModal from "../../../components/modals/ErrorModal";
import Fetch from "../../../helpers/Fetch";
import LoadingModal from "../../../components/modals/LoadingModal";
import {useEffect, useState} from "react";
import LineEdit from "../../../components/LineEdit";
import ModalList from "../../../components/ModalList";

export default function Project(props) {
    const [projectInfo, setProjectInfo] = useState({});
    const [maintainers, setMaintainers] = useState([]);
    const [addingUser, setAddingUser] = useState("");
    const {project} = useParams();
    const navigate = useNavigate();
    const {t} = useTranslation();

    const updateProjectInfo = async () => {
        const [projectInfo, maintainers] = await Promise.all([
            await Fetch.get(`/api/projects/${project}`),
            await Fetch.get(`/api/projects/${project}/maintainers`)
        ]);
        setProjectInfo(projectInfo);
        setMaintainers(maintainers.map(x => ({
            contents: x,
            onClick: () => {
                Modal.mount(<Modal heading={t("USER_PERMISSIONS_TITLE", {user: x})} buttons={[Modal.CancelButton]}>
                    <span>{t("GENERIC_PROMPT")}</span>
                    <ModalList>
                        {[
                            {
                                text: t("Remove as Project Maintainer"),
                                type: "destructive",
                                onClick: async () => {
                                    Modal.mount(<LoadingModal/>);
                                    try {
                                        await Fetch.delete(`/api/projects/${project}/maintainers/${encodeURIComponent(x)}`, {});
                                        await updateProjectInfo();

                                        Modal.unmount();
                                    } catch (error) {
                                        Modal.mount(<ErrorModal error={error}/>)
                                    }
                                }
                            }
                        ]}
                    </ModalList>
                </Modal>)
            }
        })))
    }

    useEffect(() => {
        updateProjectInfo();
    }, [])

    const deleteProject = () => {
        Modal.mount(<Modal heading={t("PROJECT_DELETE")} buttons={[
            Modal.CancelButton,
            {
                text: t("PROJECT_DELETE"),
                destructive: true,
                onClick: async () => {
                    Modal.mount(<LoadingModal/>)
                    try {
                        await Fetch.delete(`/api/projects/${project}`);
                        navigate("..");
                        Modal.unmount();
                    } catch (error) {
                        Modal.mount(<ErrorModal error={error}/>)
                    }
                },
                type: "destructive"
            }
        ]}>
            <VerticalLayout>
                <span>{t("PROJECT_DELETE_CONFIRM_PROMPT", {project: projectInfo.name})}</span>
            </VerticalLayout>
        </Modal>)
    }

    const addMaintainer = async () => {
        if (addingUser === "") return;

        Modal.mount(<LoadingModal/>);
        try {
            await Fetch.post(`/api/projects/${project}/maintainers`, {
                name: addingUser
            });
            await updateProjectInfo();

            setAddingUser("");
            Modal.unmount();
        } catch (error) {
            Modal.mount(<ErrorModal error={error}/>)
        }
    }

    return <div>
        <BackButton inListPage={true} onClick={() => navigate("..")}/>
        <ListPageBlock>
            <VerticalLayout>
                <PageHeading level={3}>{t("Project Maintainers")}</PageHeading>
                <span>{t("Project Maintainers have permissions to manage the project. They will be able to control the Git repository and will be notified when a source string is flagged for review.")}</span>
                {maintainers.length > 0 && <>
                    <SelectableList items={maintainers}/>
                    <VerticalSpacer/>
                </>}
                <span>{t("To add a user as a project maintainer, enter their username.")}</span>
                <LineEdit placeholder={t("USERNAME")} value={addingUser} style={{
                    marginBottom: "9px"
                }} onChange={e => setAddingUser(e.target.value)}/>
                <SelectableList onClick={addMaintainer} type={"destructive"}>{t("Add New Maintainer")}</SelectableList>
            </VerticalLayout>
        </ListPageBlock>
        <ListPageBlock>
            <VerticalLayout>
                <PageHeading level={3}>{t("PROJECT_DELETE")}</PageHeading>
                <span>{t("PROJECT_DELETE_PROMPT", {project: projectInfo.name})}</span>
                <SelectableList onClick={deleteProject} type={"destructive"}>{t("PROJECT_DELETE")}</SelectableList>
            </VerticalLayout>
        </ListPageBlock>
    </div>
}