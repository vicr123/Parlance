import { SubprojectLocaleMeta } from "../../../../../interfaces/projects";
import { VerticalLayout } from "../../../../../components/Layouts";
import ListPageBlock from "../../../../../components/ListPageBlock";
import PageHeading from "../../../../../components/PageHeading";
import { useTranslation } from "react-i18next";
import SelectableList from "../../../../../components/SelectableList";
import { useNavigate } from "react-router-dom";

export default function Overview({ data }: { data: SubprojectLocaleMeta }) {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const goToComments = () => {
        navigate("../comments");
    };

    return (
        <>
            <ListPageBlock>
                <VerticalLayout>
                    <PageHeading level={3}>{t("OVERVIEW_STATS")}</PageHeading>
                    <div>
                        {data.completionData.complete}/
                        {data.completionData.count} strings translated
                    </div>
                    <div>{data.completionData.warnings} warnings</div>
                    <div>{data.completionData.errors} errors</div>
                </VerticalLayout>
            </ListPageBlock>
            <ListPageBlock>
                <VerticalLayout>
                    <PageHeading level={3}>{t("COMMENTS")}</PageHeading>
                    <div>
                        {t("COMMENT_OPEN_THREADS", {
                            count: data.openThreads.length,
                        })}
                    </div>
                    <SelectableList onClick={goToComments}>
                        {t("OVERVIEW_GO_TO_COMMENTS")}
                    </SelectableList>
                </VerticalLayout>
            </ListPageBlock>
        </>
    );
}
