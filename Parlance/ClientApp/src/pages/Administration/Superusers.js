import Container from "../../components/Container";
import PageHeading from "../../components/PageHeading";
import {useTranslation} from "react-i18next";
import ListPageBlock from "../../components/ListPageBlock";
import SelectableList from "../../components/SelectableList";
import {useEffect, useState} from "react";
import Fetch from "../../helpers/Fetch";
import Modal from "../../components/Modal";
import LoadingModal from "../../components/modals/LoadingModal";
import UserManager from "../../helpers/UserManager";
import LineEdit from "../../components/LineEdit";

export default function(props) {
    const [superusers, setSuperusers] = useState([]);
    const [promotingUser, setPromotingUser] = useState("");
    const {t} = useTranslation();
    
    const updateSuperusers = async () => {
        let superusers = await Fetch.get("/api/superusers");
        setSuperusers(superusers.map(x => ({
            contents: x,
            onClick: () => {
                if (x === UserManager.currentUser.username) return;
                
                Modal.mount(<Modal heading={t("Demote User")} buttons={[
                    Modal.CancelButton,
                    {
                        text: t("DEMOTE"),
                        onClick: async () => {
                            Modal.mount(<LoadingModal/>);
                            try {
                                await Fetch.delete(`/api/superusers/${encodeURIComponent(x)}`);
                                await updateSuperusers();
                                Modal.unmount();
                            } catch (e) {
                                Modal.unmount();
                            }
                        }
                    }
                ]}>
                    <p>{t("DEMOTE_SUPERUSER_PROMPT_1", {user: x})}</p>
                    <p>{t("DEMOTE_SUPERUSER_PROMPT_2", {user: x})}</p>
                </Modal>)
            }
        })))
    };
    
    useEffect(() => {
        updateSuperusers();
    }, []);
    
    const promote = () => {
        if (promotingUser === "") {
            Modal.mount(<Modal heading={t("PROMOTE_TO_SUPERUSER")} buttons={[
                Modal.OkButton
            ]}>
                <p>{t("PROMOTE_NO_USER_PROMPT")}</p>
            </Modal>)
            return;
        }
        
        Modal.mount(<Modal heading={t("PROMOTE_TO_SUPERUSER")} buttons={[
            Modal.CancelButton,
            {
                text: t("PROMOTE"),
                onClick: async () => {
                    Modal.mount(<LoadingModal />);
                    try {
                        await Fetch.post("/api/superusers", {
                            username: promotingUser
                        });
                        await updateSuperusers();
                        
                        setPromotingUser("");
                        Modal.unmount();
                    } catch (e) {
                        Modal.unmount();
                    }
                }
            }
        ]}>
            <p>{t("PROMOTE_PROMPT_1", {user: promotingUser})}</p>
            <p>{t("PROMOTE_PROMPT_2", {user: promotingUser})}</p>
        </Modal>)
    }
    
    return <div>
        <ListPageBlock>
            <PageHeading level={3}>{t("SUPERUSERS")}</PageHeading>
            <p>{t("SUPERUSER_PROMPT_1")}</p>
            <SelectableList items={superusers} />
        </ListPageBlock>
        <ListPageBlock>
            <PageHeading level={3}>{t("PROMOTE_TO_SUPERUSER")}</PageHeading>
            <p>{t("SUPERUSER_PROMOTE_PROMPT_1")}</p>
            <LineEdit placeholder={"Username"} value={promotingUser} style={{
                marginBottom: "9px"
            }} onChange={e => setPromotingUser(e.target.value)} />
            <SelectableList onClick={promote}>{t("PROMOTE_TO_SUPERUSER")}</SelectableList>
        </ListPageBlock>
    </div>
}