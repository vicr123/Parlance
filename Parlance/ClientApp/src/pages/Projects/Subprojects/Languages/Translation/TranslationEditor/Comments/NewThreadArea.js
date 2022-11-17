import {useTranslation} from "react-i18next";

import Styles from "./NewThreadArea.module.css";
import Button from "../../../../../../../components/Button";
import UserManager from "../../../../../../../helpers/UserManager";
import Fetch from "../../../../../../../helpers/Fetch";
import {useState} from "react";

export default function NewThreadArea({project, subproject, language, tkey}) {
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const {t} = useTranslation();

    const createThread = async () => {
        await Fetch.post(`/api/comments/${project}/${subproject}/${language}/${tkey}`, {
            title: title,
            body: body
        });
    };

    return <div className={Styles.wrapper}>
        <input value={title} type={"text"} className={Styles.titleBox} placeholder={t("Thread title")}
               onChange={e => setTitle(e.target.value)}/>
        <textarea value={body} className={Styles.bodyBox} placeholder={t("Write a comment...")}
                  onChange={e => setBody(e.target.value)}/>
        <div className={Styles.buttonContainer}>
            <div className={Styles.postingPrompt}>
                {t("Posting as {{user}}", {user: UserManager.currentUser.username})}
            </div>
            <div className={Styles.buttonContainerInner}>
                <Button onClick={createThread}>{t("Create Thread")}</Button>
            </div>
        </div>
    </div>
}