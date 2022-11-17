import {useTranslation} from "react-i18next";
import Modal from "../../../../../../../components/Modal";
import {useEffect, useState} from "react";
import Fetch from "../../../../../../../helpers/Fetch";
import NewThreadArea from "./NewThreadArea";
import {VerticalLayout} from "../../../../../../../components/Layouts";
import PageHeading from "../../../../../../../components/PageHeading";

import Styles from "./CommentsModal.module.css";

export default function CommentsModal({project, subproject, language, tkey}) {
    const [threads, setThreads] = useState([]);
    const {t} = useTranslation();

    const updateThreads = async () => {
        setThreads(await Fetch.get(`/api/comments/${project}/${subproject}/${language}/${tkey}`));
    };

    useEffect(() => {
        updateThreads();
    }, [])

    return <Modal popover={true} heading={t("Comments")} onBackClicked={() => Modal.unmount()}>
        <VerticalLayout className={Styles.threadsContainer}>
            <div className={Styles.headingPadding}>
                <PageHeading level={3}>{t("Threads")}</PageHeading>
                {t("No threads")}
            </div>
        </VerticalLayout>
        <VerticalLayout>
            <div className={Styles.headingPadding}>
                <PageHeading level={3}>{t("Create New Thread")}</PageHeading>
            </div>
            <NewThreadArea project={project} subproject={subproject} language={language} tkey={tkey}/>
        </VerticalLayout>
    </Modal>
}