import BackButton from "components/BackButton";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import Styles from "./index.module.css";
import GlossaryLanguageSelector from "./GlossaryLanguageSelector";
import GlossaryTable from "./GlossaryTable";
import { useEffect, useMemo, useState } from "react";
import { Glossary, GlossaryItem } from "../../../interfaces/glossary";
import Spinner from "../../../components/Spinner";
import Fetch from "../../../helpers/Fetch";
import UserManager from "../../../helpers/UserManager";

export default function GlossaryEditor() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { glossary, language } = useParams();
    const [glossaryData, setGlossaryData] = useState<GlossaryItem[]>([]);
    const [glossaryObject, setGlossaryObject] = useState<Glossary>();
    const [done, setDone] = useState<boolean>(false);

    const canTranslate = useMemo<boolean>(
        () =>
            !!(
                UserManager.isLoggedIn &&
                (UserManager.currentUserIsSuperuser ||
                    UserManager.currentUser?.languagePermissions?.some(
                        x => x === language,
                    ))
            ),
        [language],
    );

    const updateGlossary = async () => {
        setGlossaryData(await Fetch.get(`/api/GlossaryManager/${glossary}`));
        const glossaries = await Fetch.get<Glossary[]>(`/api/GlossaryManager`);
        setGlossaryObject(glossaries.find(x => x.id == glossary));
        setDone(true);
    };

    useEffect(() => {
        updateGlossary();
    }, []);

    if (!done) {
        return <Spinner.Container />;
    }

    const onGlossaryItemAdded = (item: GlossaryItem) => {
        setGlossaryData([...glossaryData, item]);
    };

    const onGlossaryItemDeleted = (item: GlossaryItem) => {
        setGlossaryData([...glossaryData.filter(x => x.id !== item.id)]);
    };

    return (
        <div className={`${Styles.root} ${language && Styles.languageEditor}`}>
            <GlossaryLanguageSelector
                className={Styles.language}
                glossaryData={glossaryData}
            />
            <GlossaryTable
                canTranslate={canTranslate}
                className={Styles.table}
                glossaryData={glossaryData}
                glossaryObject={glossaryObject!}
                onGlossaryItemAdded={onGlossaryItemAdded}
                onGlossaryItemDeleted={onGlossaryItemDeleted}
            />
        </div>
    );
}
