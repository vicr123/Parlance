import {VerticalLayout} from "../../../../../../../components/Layouts";
import {useEffect, useState} from "react";
import Fetch from "../../../../../../../helpers/Fetch";
import ThreadReplyArea from "./ThreadReplyArea";

import Styles from "./ThreadView.module.css";
import moment from "moment";
import {useTranslation} from "react-i18next";
import {Comment, Thread} from "../../../../../../../interfaces/comments";

function ThreadComment({data}: {
    data: Comment
}) {
    return <div className={Styles.commentItem}>
        <img className={Styles.authorIcon} src={data.author.picture}/>
        <span className={Styles.authorDetails}><span
            className={Styles.authorName}>{data.author.username}</span> {moment(data.date).fromNow()}</span>
        <span className={Styles.commentText}>{data.text}</span>
    </div>
}

function EventName({event}: {
    event: string
}) {
    const {t} = useTranslation();
    const events: {[key: string]: string} = {
        "closed": t("THREAD_CLOSED_ACTION"),
        "reopened": t("THREAD_REOPENED_ACTION")
    };

    return <b className={Styles.eventName}>{events[event]}</b>;
}

function ThreadEvent({data}: {
    data: Comment
}) {
    return <div className={Styles.eventItem}>
        <img className={Styles.authorIcon} src={data.author.picture}/>
        <span className={Styles.authorDetails}><span
            className={Styles.authorName}>{data.author.username}</span> <EventName
            event={data.event!}/> {moment(data.date).fromNow()}</span>
    </div>
}

export default function ThreadView({thread, onCurrentThreadChanged, onReloadThreads}: {
    thread: Thread,
    onCurrentThreadChanged: (thread: Thread | null) => void,
    onReloadThreads: () => void
}) {
    const [threadData, setThreadData] = useState<Comment[]>([]);

    const updateThreadData = async () => {
        setThreadData(await Fetch.get(`/api/comments/${thread.id}`));
    };

    useEffect(() => {
        updateThreadData();
    }, []);

    return <VerticalLayout gap={0}>
        {threadData.map((x, i) => x.event ? <ThreadEvent key={i} data={x}/> : <ThreadComment key={i} data={x}/>)}
        <ThreadReplyArea thread={thread} onThreadDataChanged={setThreadData}
                         onCurrentThreadChanged={onCurrentThreadChanged} onReloadThreads={onReloadThreads}/>
    </VerticalLayout>
}