import {useTranslation} from "react-i18next";
import Modal from "../../../../../../../components/Modal";
import {useState} from "react";
import {VerticalLayout} from "../../../../../../../components/Layouts";
import PageHeading from "../../../../../../../components/PageHeading";

import Styles from "./CommentsModal.module.css";
import Icon from "../../../../../../../components/Icon";
import ThreadView from "./ThreadView";
import ThreadReplyArea from "./ThreadReplyArea";
import {Thread} from "../../../../../../../interfaces/comments";

function ThreadItem({item, onCurrentThreadChanged}: {
    item: Thread,
    onCurrentThreadChanged: (thread: Thread) => void
}) {
    return <div className={`${Styles.threadItem} ${item.isClosed && Styles.closed}`} onClick={() => onCurrentThreadChanged(item)}>
        <span className={Styles.threadTitle}>{item.title}</span>
        <Icon icon={"go-next"} flip={true} className={Styles.goButton}/>
        <div className={Styles.lastMessage}>{item.headCommentBody}</div>
        <div className={Styles.threadCreator}>{item.author.username}</div>
    </div>
}

export default function CommentsModal({project, subproject, language, tkey, threads, onUpdateThreads}: {
    project: string,
    subproject: string,
    language: string,
    tkey: string,
    threads: Thread[],
    onUpdateThreads: () => void
}) {
    const [currentThread, setCurrentThread] = useState<Thread | null>();
    const {t} = useTranslation();

    const goBack = () => {
        if (currentThread) {
            setCurrentThread(null);
        } else {
            Modal.unmount();
        }
    };

    return <Modal popover={true} heading={currentThread?.title || t("COMMENTS")} onBackClicked={goBack}>
        {currentThread ? <ThreadView thread={currentThread} onCurrentThreadChanged={setCurrentThread}
                                     onReloadThreads={onUpdateThreads}/> :
            <>
                <VerticalLayout className={Styles.threadsContainer} gap={0}>
                    <div className={Styles.headingPadding}>
                        <PageHeading level={3}>{t("THREADS")}</PageHeading>
                    </div>
                    {threads.map((x, i) => <ThreadItem key={i} item={x}
                                                       onCurrentThreadChanged={setCurrentThread}/>) || t("THREADS_NO_THREADS")}
                </VerticalLayout>
                <VerticalLayout>
                    <div className={Styles.headingPadding}>
                        <PageHeading level={3}>{t("THREADS_NEW_THREAD")}</PageHeading>
                    </div>
                    <ThreadReplyArea project={project} subproject={subproject} language={language} tkey={tkey}
                                     onReloadThreads={onUpdateThreads} onCurrentThreadChanged={setCurrentThread}/>
                </VerticalLayout>
            </>}
    </Modal>
}