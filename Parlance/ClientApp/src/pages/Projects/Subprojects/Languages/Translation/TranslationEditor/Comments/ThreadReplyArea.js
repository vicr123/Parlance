import {useTranslation} from "react-i18next";

import Styles from "./ThreadReplyArea.module.css";
import Button from "../../../../../../../components/Button";
import UserManager from "../../../../../../../helpers/UserManager";
import Fetch from "../../../../../../../helpers/Fetch";
import {useState} from "react";

export default function ThreadReplyArea({
                                            project,
                                            subproject,
                                            language,
                                            tkey,
                                            thread,
                                            onReloadThreads,
                                            onCurrentThreadChanged, onThreadDataChanged
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
                onThreadDataChanged(await Fetch.post(`/api/comments/${thread.id}`, {
                    body: body
                }));
            } catch {
                setError(t("Unable to send the comment"))
                return;
            }
        } else {
            let thread;
            try {
                thread = await Fetch.post(`/api/comments/${project}/${subproject}/${language}/${tkey}`, {
                    title: title,
                    body: body
                });
            } catch {
                setError(t("Unable to create the thread"))
                return;
            }
            onReloadThreads();
            onCurrentThreadChanged(thread);
        }

        setTitle("");
        setBody("");
    };

    const toggleClosed = async () => {
        let comments, newThread;
        if (thread.isClosed) {
            try {
                ({comments, thread: newThread} = await Fetch.delete(`/api/comments/${thread.id}/close`));
            } catch {
                setError(t("Unable to reopen the thread"))
                return;
            }
        } else {
            try {
                ({comments, thread: newThread} = await Fetch.post(`/api/comments/${thread.id}/close`));
            } catch {
                setError(t("Unable to close the thread"))
                return;
            }
        }

        onThreadDataChanged(comments);
        onReloadThreads();
        onCurrentThreadChanged(newThread);
    }

    return <div className={Styles.wrapper}>
        {!threadId && <input value={title} type={"text"} className={Styles.titleBox} placeholder={t("Thread title")}
                             onChange={e => setTitle(e.target.value)}/>}
        <textarea value={body} className={Styles.bodyBox} placeholder={t("Write a comment...")}
                  onChange={e => setBody(e.target.value)}/>
        {error && <div className={Styles.buttonContainer}>
            <span>{error}</span>
        </div>}
        <div className={Styles.buttonContainer}>
            <div className={Styles.postingPrompt}>
                {t("Posting as {{user}}", {user: UserManager.currentUser.username})}
            </div>
            <div className={Styles.buttonContainerInner}>
                {threadId && <>
                    <Button onClick={toggleClosed}>{thread.isClosed ? t("Reopen Thread") : t("Close Thread")}</Button>
                </>}
                <Button onClick={createThread}>{threadId ? t("Post Comment") : t("Create Thread")}</Button>
            </div>
        </div>
    </div>
}