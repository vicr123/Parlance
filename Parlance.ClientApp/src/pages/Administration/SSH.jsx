import {useEffect, useState} from "react";
import Fetch from "../../helpers/Fetch";
import ListPageBlock from "../../components/ListPageBlock";
import PageHeading from "../../components/PageHeading";
import {useTranslation} from "react-i18next";
import SelectableList from "../../components/SelectableList";
import Modal from "../../components/Modal";
import LoadingModal from "../../components/modals/LoadingModal";
import {VerticalLayout} from "../../components/Layouts";

export default function (props) {
    const [haveSshKey, setHaveSshKey] = useState(null);
    const [sshKey, setSshKey] = useState();
    const {t} = useTranslation();
    
    const updateSshKey = async () => {
        try {
        let keyDetails = await Fetch.get("/api/ssh");
        setSshKey(keyDetails.publicKey);
            setHaveSshKey(true);
        } catch {
            setHaveSshKey(false);
        }
    };
    
    useEffect(() => {
        updateSshKey();
    }, []);
    
    if (haveSshKey === null) {
        return <div></div>
    }
    
    const generateKey = async () => {
        Modal.mount(<LoadingModal />);
        await Fetch.post("/api/ssh", {});
        await updateSshKey();
        Modal.unmount();
    };
    
    const copyKey = async () => {
        await navigator.clipboard.writeText(sshKey);
    };
    
    const deleteKey = async () => {
        Modal.mount(<Modal heading={t("SERVER_SSH_KEY_DELETE")} buttons={[
            Modal.CancelButton,
            {
                text: t("SERVER_SSH_KEY_DELETE"),
                onClick: async () => {
                    Modal.mount(<LoadingModal />);
                    await Fetch.delete("/api/ssh", {});
                    await updateSshKey();
                    Modal.unmount();
                },
                destructive: true
            }
        ]}>
            <VerticalLayout>
                <span>{t("SERVER_SSH_KEY_DELETE_PROMPT_1")}</span>
                <span>{t("SERVER_SSH_KEY_DELETE_PROMPT_2")}</span>
            </VerticalLayout>
        </Modal>)
    };
    
    let sshKeySection = haveSshKey ?
        <>
            <p>{t("SERVER_SSH_KEY_VALID_PROMPT")}</p>
            <code style={{
                overflowWrap: "word-break"
            }}>{sshKey}</code>
            <SelectableList items={[
                {
                    contents: t("SERVER_SSH_KEY_COPY"),
                    onClick: copyKey
                },
                {
                    contents: t("SERVER_SSH_KEY_DELETE"),
                    onClick: deleteKey
                }
            ]}/>
        </> : <>
            <p>{t("SERVER_SSH_KEY_INVALID_PROMPT")}</p>
            <SelectableList onClick={generateKey}>{t("SERVER_SSH_KEY_GENERATE")}</SelectableList>
        </>;
    
    return <div>
        <ListPageBlock>
            <PageHeading level={3}>{t("SERVER_SSH_KEY")}</PageHeading>
            {sshKeySection}
        </ListPageBlock>
    </div>
}