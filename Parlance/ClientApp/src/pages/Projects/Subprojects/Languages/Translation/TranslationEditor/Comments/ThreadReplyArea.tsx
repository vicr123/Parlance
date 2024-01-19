import {useTranslation} from "react-i18next";

import Styles from "./ThreadReplyArea.module.css";
import Button from "../../../../../../../components/Button";
import UserManager from "../../../../../../../helpers/UserManager";
import Fetch from "../../../../../../../helpers/Fetch";
import {useState} from "react";
import {Comment, Thread} from "../../../../../../../interfaces/comments";

interface CloseResponse {
    comments: Comment[],
    thread: Thread
}

export default function ThreadReplyArea({
                                            project,
                                            subproject,
                                            language,
                                            tkey,
                                            thread,
                                            onReloadThreads,
                                            onCurrentThreadChanged, onThreadDataChanged
                                        }: {
    project?: string,
    subproject?: string,
    language?: string,
    tkey?: string,
    thread?: Thread,
    onReloadThreads: () => void,
    onCurrentThreadChanged: (thread: Thread | null) => void,
    onThreadDataChanged?: (threadData: Comment[]) => void
}) {
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [error, setError] = useState("");
    const {t} = useTranslation();

    const threadId = thread?.id;

    const createThread = async () => {
        setError("");
        if (threadId) {
            try {
                onThreadDataChanged!(await Fetch.post(`/api/comments/${thread.id}`, {
                    body: body
                }));
            } catch {
                setError(t("COMMENT_SEND_FAILURE_PROMPT"))
                return;
            }
        } else {
            let thread: Thread | null;
            try {
                thread = await Fetch.post(`/api/comments/${project}/${subproject}/${language}/${tkey}`, {
                    title: title,
                    body: body
                });
            } catch {
                setError(t("THREAD_CREATE_FAILURE_PROMPT"))
                return;
            }
            onReloadThreads();
            onCurrentThreadChanged(thread);
        }

        setTitle("");
        setBody("");
    };

    const toggleClosed = async () => {
        if (!thread) return;
        
        let comments, newThread;
        if (thread.isClosed) {
            try {
                ({comments, thread: newThread} = await Fetch.delete<CloseResponse>(`/api/comments/${thread.id}/close`));
            } catch {
                setError(t("THREAD_REOPEN_FAILURE_PROMPT"))
                return;
            }
        } else {
            try {
                ({comments, thread: newThread} = await Fetch.post<CloseResponse>(`/api/comments/${thread.id}/close`, null));
            } catch {
                setError(t("THREAD_CLOSE_FAILURE_PROMPT"))
                return;
            }
        }

        onThreadDataChanged!(comments);
        onReloadThreads();
        onCurrentThreadChanged(newThread);
    }

    return <div className={Styles.wrapper}>
        {!threadId && <input value={title} type={"text"} className={Styles.titleBox} placeholder={t("THREAD_TITLE")}
                             onChange={e => setTitle(e.target.value)}/>}
        <textarea value={body} className={Styles.bodyBox} placeholder={t("WRITE_COMMENT_PLACEHOLDER")}
                  onChange={e => setBody(e.target.value)}/>
        {error && <div className={Styles.buttonContainer}>
            <span>{error}</span>
        </div>}
        <div className={Styles.buttonContainer}>
            <div className={Styles.postingPrompt}>
                {t("COMMENT_POSTING_AS_PROMPT", {user: UserManager.currentUser!.username})}
            </div>
            <div className={Styles.buttonContainerInner}>
                {threadId && <>
                    <Button onClick={toggleClosed}>{thread.isClosed ? t("THREAD_REOPEN") : t("THREAD_CLOSE")}</Button>
                </>}
                <Button onClick={createThread}>{threadId ? t("COMMENT_POST") : t("THREAD_CREATE")}</Button>
            </div>
        </div>
    </div>
}