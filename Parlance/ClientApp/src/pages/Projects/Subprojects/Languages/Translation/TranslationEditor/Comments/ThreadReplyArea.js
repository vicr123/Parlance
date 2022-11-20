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
    const {t} = useTranslation();

    const threadId = thread?.id;

    const createThread = async () => {
        if (threadId) {
            onThreadDataChanged(await Fetch.post(`/api/comments/${thread.id}`, {
                body: body
            }));
        } else {
            const thread = await Fetch.post(`/api/comments/${project}/${subproject}/${language}/${tkey}`, {
                title: title,
                body: body
            });
            onReloadThreads();
            onCurrentThreadChanged(thread);
        }

        setTitle("");
        setBody("");
    };

    return <div className={Styles.wrapper}>
        {!threadId && <input value={title} type={"text"} className={Styles.titleBox} placeholder={t("Thread title")}
                             onChange={e => setTitle(e.target.value)}/>}
        <textarea value={body} className={Styles.bodyBox} placeholder={t("Write a comment...")}
                  onChange={e => setBody(e.target.value)}/>
        <div className={Styles.buttonContainer}>
            <div className={Styles.postingPrompt}>
                {t("Posting as {{user}}", {user: UserManager.currentUser.username})}
            </div>
            <div className={Styles.buttonContainerInner}>
                <Button onClick={createThread}>{threadId ? t("Post Comment") : t("Create Thread")}</Button>
            </div>
        </div>
    </div>
}