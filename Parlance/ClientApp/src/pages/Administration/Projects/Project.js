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

export default function Project(props) {
    const {project} = useParams();
    const navigate = useNavigate();
    const {t} = useTranslation();
    
    const deleteProject = () => {
        Modal.mount(<Modal heading={t("Delete Project")} buttons={[
            Modal.CancelButton,
            {
                text: t("Delete Project"),
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
                <span>{t("Deleting xyz")}</span>
            </VerticalLayout>
        </Modal>)
    }
    
    return <div>
        <BackButton inListPage={true} onClick={() => navigate("..")}/>
        <ListPageBlock>
            <VerticalLayout>
                <PageHeading level={3}>{t("Delete Project")}</PageHeading>
                <span>{t("Delete")}</span>
                <SelectableList onClick={deleteProject} type={"destructive"}>{t("Delete Project")}</SelectableList>
            </VerticalLayout>
        </ListPageBlock>
    </div>
}