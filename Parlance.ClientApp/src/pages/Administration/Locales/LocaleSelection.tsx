import ListPageBlock from "../../../components/ListPageBlock";
import { VerticalLayout } from "@/components/Layouts";
import PageHeading from "../../../components/PageHeading";
import { useTranslation } from "react-i18next";
import SelectableList from "../../../components/SelectableList";
import { useNavigate } from "react-router-dom";

export default function LocaleSelection() {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const localeSelected = (locale: string) => {
        navigate(locale);
    };

    return (
        <div>
            <ListPageBlock>
                <VerticalLayout>
                    <PageHeading level={3}>{t("LOCALES")}</PageHeading>
                    <span>{t("LOCALES_PROMPT")}</span>
                    <SelectableList.Locales onLocaleSelected={localeSelected} />
                </VerticalLayout>
            </ListPageBlock>
        </div>
    );
}
