import BackButton from "../../../components/BackButton";
import {useNavigate} from "react-router-dom";
import {useTranslation} from "react-i18next";
import {VerticalLayout} from "../../../components/Layouts";

interface GlossaryLanguageSelectorProps {
    className: string;
}

export default function GlossaryLanguageSelector({className}: GlossaryLanguageSelectorProps) {
    const {t} = useTranslation();
    const navigate = useNavigate();
    
    return <VerticalLayout gap={0} className={className}>
        <BackButton text={t("Back to Glossaries")} onClick={() => navigate("../")} inTranslationView={true} />
    </VerticalLayout>
}