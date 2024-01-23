import {Thread} from "../../interfaces/comments";
import Styles from "./ThreadItem.module.css";
import Icon from "../Icon";
import {useTranslation} from "react-i18next";
import moment from "moment";

export function ThreadItem({item, onCurrentThreadChanged, noPadding}: {
    item: Thread,
    onCurrentThreadChanged: (thread: Thread) => void,
    noPadding?: boolean
}) {
    const {t} = useTranslation();
    
    return <div className={`${Styles.threadItem} ${item.isClosed && Styles.closed} ${noPadding && Styles.noPadding}`} onClick={() => onCurrentThreadChanged(item)}>
        <span className={Styles.threadTitle}>{item.title}</span>
        <Icon icon={"go-next"} flip={true} className={Styles.goButton}/>
        <div className={Styles.lastMessageDate}>
            {moment(item.headComment.date).fromNow(false)}
        </div>
        <div className={Styles.lastMessage}>
            <span>{item.headComment.text}</span>
            &nbsp;&mdash;&nbsp;
            <span className={Styles.threadCreator}>
                <img className={Styles.threadCreatorImage} src={item.headComment.author.picture} alt={t("COMMENT_THREAD_PROFILE_PICTURE_ALT_TEXT", { user: item.headComment.author.username })} />
                {item.headComment.author.username} 
            </span>
        </div>
    </div>
}