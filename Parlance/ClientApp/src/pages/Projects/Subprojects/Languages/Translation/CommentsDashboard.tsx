import ListPageBlock from "../../../../../components/ListPageBlock";
import {VerticalLayout} from "../../../../../components/Layouts";
import PageHeading from "../../../../../components/PageHeading";
import {useTranslation} from "react-i18next";
import SelectableList from "../../../../../components/SelectableList";
import {useEffect, useState} from "react";
import {Thread} from "../../../../../interfaces/comments";
import {useParams} from "react-router-dom";
import Fetch from "../../../../../helpers/Fetch";
import {ThreadItem} from "../../../../../components/comments/ThreadItem";

export function CommentsDashboard() {
    const {project, subproject, language} = useParams();
    const {t} = useTranslation();
    const [comments, setComments] = useState<Thread[]>();
    
    useEffect(() => {
        (async () => {
            setComments(await Fetch.get(`/api/comments/${project}/${subproject}/${language}`));
        })();
    }, []);
    
    return <div>
        <ListPageBlock>
            <VerticalLayout>
                <PageHeading level={3}>{t("COMMENTS")}</PageHeading>
                <SelectableList items={comments ? comments.map(thread => ({
                    contents: <ThreadItem noPadding={true} item={thread} onCurrentThreadChanged={() => {}}/>
                })) : SelectableList.PreloadingText(3)} />
            </VerticalLayout>
        </ListPageBlock>
    </div>
}
