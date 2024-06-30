import BackButton from "../../../components/BackButton";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { VerticalLayout } from "../../../components/Layouts";
import UserManager from "../../../helpers/UserManager";
import { GlossaryItem } from "../../../interfaces/glossary";
import I18n from "../../../helpers/i18n";

import Styles from "./GlossaryLanguageSelector.module.css";
import PageHeading from "../../../components/PageHeading";

interface GlossaryLanguageSelectorProps {
    className: string;
    glossaryData: GlossaryItem[];
}

interface LanguagePickerProps {
    lang: string;
}

function LanguagePicker({ lang }: LanguagePickerProps) {
    const { glossary, language } = useParams();
    const navigate = useNavigate();

    const navigateToLanguage = () => {
        navigate(language ? `../${glossary}/${lang}` : lang);
    };

    return (
        <div
            className={`${Styles.language} ${language === lang && Styles.selected}`}
            onClick={navigateToLanguage}
        >
            {I18n.humanReadableLocale(lang)}
        </div>
    );
}

export default function GlossaryLanguageSelector({
    className,
    glossaryData,
}: GlossaryLanguageSelectorProps) {
    const { t } = useTranslation();
    const navigate = useNavigate();

    let showLanguages = [
        ...(UserManager.currentUser?.languagePermissions ?? []),
        ...glossaryData.map(item => item.lang),
    ];
    showLanguages = showLanguages.filter(
        (x, i) => showLanguages.indexOf(x) === i,
    );
    const myLanguages =
        UserManager.currentUser?.languagePermissions &&
        showLanguages.filter(lang =>
            UserManager.currentUser!.languagePermissions.includes(lang),
        );
    const otherLanguages = UserManager.currentUser?.languagePermissions
        ? showLanguages.filter(
              lang =>
                  !UserManager.currentUser!.languagePermissions.includes(lang),
          )
        : showLanguages;

    return (
        <VerticalLayout className={className}>
            <BackButton
                text={t("QUIT")}
                onClick={() => navigate("../")}
                inTranslationView={true}
            />
            {myLanguages && myLanguages?.length !== 0 && (
                <div className={Styles.languageListInner}>
                    <PageHeading className={Styles.languageGroup} level={3}>
                        {t("MY_LANGUAGES")}
                    </PageHeading>
                    {myLanguages?.map(lang => <LanguagePicker lang={lang} />)}
                </div>
            )}
            {otherLanguages && otherLanguages?.length !== 0 && (
                <div className={Styles.languageListInner}>
                    <PageHeading className={Styles.languageGroup} level={3}>
                        {t("OTHER_LANGUAGES")}
                    </PageHeading>
                    {otherLanguages?.map(lang => (
                        <LanguagePicker lang={lang} />
                    ))}
                </div>
            )}
        </VerticalLayout>
    );
}
