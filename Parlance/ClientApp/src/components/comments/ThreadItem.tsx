import {Thread} from "../../interfaces/comments";
import Styles from "./ThreadItem.module.css";
import Icon from "../Icon";

export function ThreadItem({item, onCurrentThreadChanged, noPadding}: {
    item: Thread,
    onCurrentThreadChanged: (thread: Thread) => void,
    noPadding?: boolean
}) {
    return <div className={`${Styles.threadItem} ${item.isClosed && Styles.closed} ${noPadding && Styles.noPadding}`} onClick={() => onCurrentThreadChanged(item)}>
        <span className={Styles.threadTitle}>{item.title}</span>
        <Icon icon={"go-next"} flip={true} className={Styles.goButton}/>
        <div className={Styles.lastMessage}>{item.headCommentBody}</div>
        <div className={Styles.threadCreator}>{item.author.username}</div>
    </div>
}