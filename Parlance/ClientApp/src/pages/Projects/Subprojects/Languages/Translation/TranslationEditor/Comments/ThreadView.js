import {VerticalLayout} from "../../../../../../../components/Layouts";
import {useEffect, useState} from "react";
import Fetch from "../../../../../../../helpers/Fetch";
import ThreadReplyArea from "./ThreadReplyArea";

import Styles from "./ThreadView.module.css";
import moment from "moment";

function ThreadComment({data}) {
    return <div className={Styles.commentItem}>
        <img className={Styles.authorIcon} src={data.author.picture}/>
        <span className={Styles.authorDetails}><span
            className={Styles.authorName}>{data.author.username}</span> {moment(data.date).fromNow()}</span>
        <span className={Styles.commentText}>{data.text}</span>
    </div>
}

export default function ThreadView({thread}) {
    const [threadData, setThreadData] = useState([]);

    const updateThreadData = async () => {
        setThreadData(await Fetch.get(`/api/comments/${thread.id}`));
    };

    useEffect(() => {
        updateThreadData();
    }, []);

    return <VerticalLayout>
        {threadData.map((x, i) => <ThreadComment key={i} data={x}/>)}
        <ThreadReplyArea thread={thread} onThreadDataChanged={setThreadData}/>
    </VerticalLayout>
}