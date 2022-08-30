import BackButton from "../../../components/BackButton";
import ListPageBlock from "../../../components/ListPageBlock";
import {VerticalLayout} from "../../../components/Layouts";
import PageHeading from "../../../components/PageHeading";
import SelectableList from "../../../components/SelectableList";
import {useNavigate, useParams} from "react-router-dom";
import {useTranslation} from "react-i18next";
import Modal from "../../../components/Modal";
import ErrorModal from "../../../components/modals/ErrorModal";
import Fetch from "../../../helpers/Fetch";
import LoadingModal from "../../../components/modals/LoadingModal";
import {useEffect, useState} from "react";

export default function Project(props) {
    const [projectInfo, setProjectInfo] = useState({});
    const {project} = useParams();
    const navigate = useNavigate();
    const {t} = useTranslation();
    
    const updateProjectInfo = async () => {
        setProjectInfo(await Fetch.get(`/api/projects/${project}`));
    }
    
    useEffect(() => {
        updateProjectInfo();
    }, [])
    
    const deleteProject = () => {
        Modal.mount(<Modal heading={t("PROJECT_DELETE")} buttons={[
            Modal.CancelButton,
            {
                text: t("PROJECT_DELETE"),
                onClick: async () => {
                    Modal.mount(<LoadingModal />)
                    try {
                        await Fetch.delete(`/api/projects/${project}`);
                        navigate("..");
                        Modal.unmount();
                    } catch (error) {
                        Modal.mount(<ErrorModal error={error} />)
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
    
    return <div>
        <BackButton inListPage={true} onClick={() => navigate("..")}/>
        <ListPageBlock>
            <VerticalLayout>
                <PageHeading level={3}>{t("PROJECT_DELETE")}</PageHeading>
                <span>{t("PROJECT_DELETE_PROMPT", {project: projectInfo.name})}</span>
                <SelectableList onClick={deleteProject} type={"destructive"}>{t("PROJECT_DELETE")}</SelectableList>
            </VerticalLayout>
        </ListPageBlock>
    </div>
}