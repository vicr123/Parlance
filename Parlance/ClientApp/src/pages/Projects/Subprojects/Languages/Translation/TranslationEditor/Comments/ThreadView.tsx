import {HorizontalLayout, VerticalLayout} from "../../../../../../../components/Layouts";
import {useEffect, useState} from "react";
import Fetch from "../../../../../../../helpers/Fetch";
import ThreadReplyArea from "./ThreadReplyArea";

import Styles from "./ThreadView.module.css";
import moment from "moment";
import {useTranslation} from "react-i18next";
import {Comment, Thread} from "../../../../../../../interfaces/comments";
import PageHeading from "../../../../../../../components/PageHeading";
import SmallButton from "../../../../../../../components/SmallButton";
import {ButtonGroup} from "reactstrap";
import Modal from "../../../../../../../components/Modal";
import {useNavigate} from "react-router-dom";
import I18n from "../../../../../../../helpers/i18n";

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

function ThreadHeader({thread}: {
    thread: Thread
}) {
    const {t} = useTranslation();
    
    const goToString = () => {
        Modal.unmount();
        window.location.pathname = `/projects/${thread.project}/${thread.subproject}/${thread.language}/translate/${thread.key}`;
    }
    
    return <div className={Styles.headerItem}>
        <VerticalLayout>
            <PageHeading level={4}>{t("COMMENT_ORIGINAL_TRANSLATION")}</PageHeading>
            <div dir={I18n.dir(thread.language)}>{thread.sourceTranslation}</div>
            <HorizontalLayout>
                <SmallButton onClick={goToString}>{t("COMMENT_GO_TO_STRING")}</SmallButton>
            </HorizontalLayout>
        </VerticalLayout>
    </div>
}

export default function ThreadView({thread, onCurrentThreadChanged, onReloadThreads, showHeader}: {
    thread: Thread,
    onCurrentThreadChanged: (thread: Thread | null) => void,
    onReloadThreads: () => void,
    showHeader?: boolean
}) {
    const [threadData, setThreadData] = useState<Comment[]>([]);

    const updateThreadData = async () => {
        setThreadData(await Fetch.get(`/api/comments/${thread.id}`));
    };

    useEffect(() => {
        updateThreadData();
    }, []);

    return <VerticalLayout gap={0}>
        {showHeader && <ThreadHeader thread={thread} />}
        {threadData.map((x, i) => x.event ? <ThreadEvent key={i} data={x}/> : <ThreadComment key={i} data={x}/>)}
        <ThreadReplyArea thread={thread} onThreadDataChanged={setThreadData}
                         onCurrentThreadChanged={onCurrentThreadChanged} onReloadThreads={onReloadThreads}/>
    </VerticalLayout>
}