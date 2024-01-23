import ListPageBlock from "../../../../../components/ListPageBlock";
import {VerticalLayout} from "../../../../../components/Layouts";
import PageHeading from "../../../../../components/PageHeading";
import {useTranslation} from "react-i18next";
import SelectableList from "../../../../../components/SelectableList";

export function CommentsDashboard() {
    const {t} = useTranslation();
    
    return <div>
        <ListPageBlock>
            <VerticalLayout>
                <PageHeading level={3}>{t("COMMENTS")}</PageHeading>
                <SelectableList items={SelectableList.PreloadingText(3)} />
            </VerticalLayout>
        </ListPageBlock>
    </div>
}
