import { useTranslation } from "react-i18next";
import Modal from "../../../../../../../components/Modal";
import { useState } from "react";
import { VerticalLayout } from "../../../../../../../components/Layouts";
import PageHeading from "../../../../../../../components/PageHeading";

import Styles from "./CommentsModal.module.css";
import Icon from "../../../../../../../components/Icon";
import ThreadView from "./ThreadView";
import ThreadReplyArea from "./ThreadReplyArea";
import { Thread } from "../../../../../../../interfaces/comments";
import { ThreadItem } from "../../../../../../../components/comments/ThreadItem";
import UserManager from "../../../../../../../helpers/UserManager";

export function CommentsModal({
    project,
    subproject,
    language,
    tkey,
    threads,
    onUpdateThreads,
}: {
    project: string;
    subproject: string;
    language: string;
    tkey: string;
    threads: Thread[];
    onUpdateThreads: () => void;
}) {
    const [currentThread, setCurrentThread] = useState<Thread | null>();
    const { t } = useTranslation();

    const goBack = () => {
        if (currentThread) {
            setCurrentThread(null);
        } else {
            Modal.unmount();
        }
    };

    return (
        <Modal
            popover={true}
            heading={currentThread?.title || t("COMMENTS")}
            onBackClicked={goBack}
        >
            {currentThread ? (
                <ThreadView
                    thread={currentThread}
                    onCurrentThreadChanged={setCurrentThread}
                    onReloadThreads={onUpdateThreads}
                />
            ) : (
                <>
                    <VerticalLayout className={Styles.threadsContainer} gap={0}>
                        <div className={Styles.headingPadding}>
                            <PageHeading level={3}>{t("THREADS")}</PageHeading>
                        </div>
                        {threads.length ? (
                            threads.map((x, i) => (
                                <ThreadItem
                                    key={i}
                                    item={x}
                                    onCurrentThreadChanged={setCurrentThread}
                                />
                            ))
                        ) : (
                            <div className={Styles.noThreads}>
                                {t("THREADS_NO_THREADS")}
                            </div>
                        )}
                    </VerticalLayout>
                    {UserManager.currentUser && (
                        <>
                            <VerticalLayout>
                                <div className={Styles.headingPadding}>
                                    <PageHeading level={3}>
                                        {t("THREADS_NEW_THREAD")}
                                    </PageHeading>
                                </div>
                                <ThreadReplyArea
                                    project={project}
                                    subproject={subproject}
                                    language={language}
                                    tkey={tkey}
                                    onReloadThreads={onUpdateThreads}
                                    onCurrentThreadChanged={setCurrentThread}
                                />
                            </VerticalLayout>
                        </>
                    )}
                </>
            )}
        </Modal>
    );
}

export function CommentsThreadModal({
    thread,
    onUpdateThreads,
    showHeader,
}: {
    thread: Thread;
    onUpdateThreads: () => void;
    showHeader?: boolean;
}) {
    return (
        <Modal
            popover={true}
            heading={thread.title}
            onBackClicked={() => Modal.unmount()}
        >
            <ThreadView
                thread={thread}
                onCurrentThreadChanged={() => {}}
                onReloadThreads={onUpdateThreads}
                showHeader={showHeader}
            />
        </Modal>
    );
}
