import {VerticalLayout} from "../../../../../../../components/Layouts";
import {useEffect, useState} from "react";
import Fetch from "../../../../../../../helpers/Fetch";
import ThreadReplyArea from "./ThreadReplyArea";

import Styles from "./ThreadView.module.css";
import moment from "moment";
import {useTranslation} from "react-i18next";

function ThreadComment({data}) {
    return <div className={Styles.commentItem}>
        <img className={Styles.authorIcon} src={data.author.picture}/>
        <span className={Styles.authorDetails}><span
            className={Styles.authorName}>{data.author.username}</span> {moment(data.date).fromNow()}</span>
        <span className={Styles.commentText}>{data.text}</span>
    </div>
}

function EventName({event}) {
    const {t} = useTranslation();
    const events = {
        "closed": t("THREAD_CLOSED_ACTION"),
        "reopened": t("THREAD_REOPENED_ACTION")
    };

    return <b className={Styles.eventName}>{events[event]}</b>;
}

function ThreadEvent({data}) {
    return <div className={Styles.eventItem}>
        <img className={Styles.authorIcon} src={data.author.picture}/>
        <span className={Styles.authorDetails}><span
            className={Styles.authorName}>{data.author.username}</span> <EventName
            event={data.event}/> {moment(data.date).fromNow()}</span>
    </div>
}

export default function ThreadView({thread, onCurrentThreadChanged, onReloadThreads}) {
    const [threadData, setThreadData] = useState([]);

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