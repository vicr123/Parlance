import ListPageBlock from "../../../../../components/ListPageBlock";
import { VerticalLayout } from "../../../../../components/Layouts";
import PageHeading from "../../../../../components/PageHeading";
import { useTranslation } from "react-i18next";
import SelectableList from "../../../../../components/SelectableList";
import { useEffect, useState } from "react";
import { Thread } from "../../../../../interfaces/comments";
import { useParams } from "react-router-dom";
import Fetch from "../../../../../helpers/Fetch";
import { ThreadItem } from "../../../../../components/comments/ThreadItem";
import PreloadingBlock from "../../../../../components/PreloadingBlock";
import SilentInformation from "../../../../../components/SilentInformation";
import Modal from "../../../../../components/Modal";
import { CommentsThreadModal } from "./TranslationEditor/Comments/CommentsModal";

export function CommentsDashboard() {
    const { project, subproject, language } = useParams();
    const { t } = useTranslation();
    const [comments, setComments] = useState<Thread[] | null>();

    const updateComments = async () => {
        setComments(null);
        setComments(
            await Fetch.get(
                `/api/comments/${project}/${subproject}/${language}`,
            ),
        );
    };

    useEffect(() => {
        void updateComments();
    }, []);

    const openThread = (thread: Thread) => {
        Modal.mount(
            <CommentsThreadModal
                thread={thread}
                onUpdateThreads={updateComments}
                showHeader={true}
            />,
        );
    };

    return (
        <div>
            <ListPageBlock>
                <VerticalLayout>
                    <PageHeading level={3}>{t("COMMENTS")}</PageHeading>
                    {comments?.length === 0 ? (
                        <div>
                            <SilentInformation
                                title={t("OVERVIEW_COMMENTS_NO_OPEN_THREADS")}
                                text={t(
                                    "OVERVIEW_COMMENTS_NO_OPEN_THREADS_DESCRIPTION",
                                )}
                            />
                        </div>
                    ) : (
                        <>
                            {comments ? (
                                <div>
                                    {t("COMMENT_OPEN_THREADS", {
                                        count: comments.length,
                                    })}
                                </div>
                            ) : (
                                <PreloadingBlock>
                                    {t("COMMENT_OPEN_THREADS", { count: 0 })}
                                </PreloadingBlock>
                            )}
                            <SelectableList
                                items={
                                    comments
                                        ? comments.map(thread => ({
                                              contents: (
                                                  <ThreadItem
                                                      noPadding={true}
                                                      item={thread}
                                                      onCurrentThreadChanged={() => {}}
                                                  />
                                              ),
                                              onClick: () => openThread(thread),
                                          }))
                                        : SelectableList.PreloadingText(3)
                                }
                            />
                        </>
                    )}
                </VerticalLayout>
            </ListPageBlock>
        </div>
    );
}
