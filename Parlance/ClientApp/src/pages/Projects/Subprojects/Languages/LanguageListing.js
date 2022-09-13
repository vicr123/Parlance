import {useNavigate, useParams} from "react-router-dom";
import React, {useEffect, useReducer, useState} from "react";
import Fetch from "../../../../helpers/Fetch";
import Container from "../../../../components/Container";
import PageHeading from "../../../../components/PageHeading";
import SelectableList from "../../../../components/SelectableList";
import i18n from "../../../../helpers/i18n";
import TranslationProgressIndicator from "../../../../components/TranslationProgressIndicator";
import UserManager from "../../../../helpers/UserManager";
import Modal from "../../../../components/Modal";
import {useTranslation} from "react-i18next";
import ErrorModal from "../../../../components/modals/ErrorModal";
import LoadingModal from "../../../../components/modals/LoadingModal";

export default function (props) {
    const [ignored, forceUpdate] = useReducer(x => x + 1, 0);
    const {project, subproject} = useParams();
    const [languages, setLanguages] = useState([]);
    const navigate = useNavigate();
    const {t} = useTranslation();

    UserManager.on("currentUserChanged", forceUpdate);

    const updateProjects = async () => {
        let subprojectData = await Fetch.get(`/api/projects/${project}/${subproject}`);
        setLanguages(subprojectData.availableLanguages);
    };

    useEffect(() => {
        updateProjects();
    }, []);

    const seenLanguages = [];
    const showLanguages = [...languages, ...(UserManager.currentUser?.languagePermissions?.map(language => ({
        language,
        completionData: {}
    })) || [])]
        .filter(x => {
            if (seenLanguages.includes(x.language)) return false;
            seenLanguages.push(x.language);
            return true;
        })
        .sort((a, b) => i18n.humanReadableLocale(a.language) > i18n.humanReadableLocale(b.language));

    const translationClicked = language => {
        if (languages.some(l => l.language === language)) {
            navigate(language);
        } else {
            Modal.mount(<Modal heading={t("START_NEW_TRANSLATION")} buttons={[
                Modal.CancelButton,
                {
                    text: t("START_NEW_TRANSLATION_CREATE_TRANSLATION_FILE"),
                    onClick: async () => {
                        Modal.mount(<LoadingModal/>);

                        try {
                            await Fetch.post(`/api/projects/${project}/${subproject}/${language}`, {});
                            navigate(language);
                            Modal.unmount();
                        } catch (error) {
                            Modal.mount(<ErrorModal error={error}/>)
                        }
                    }
                }
            ]}>
                {t("START_NEW_TRANSLATION_PROMPT", {lang: i18n.humanReadableLocale(language)})}
            </Modal>)
        }
    }

    return <div>
        <Container>
            <PageHeading level={3}>{t("AVAILABLE_LANGUAGES")}</PageHeading>
            <SelectableList items={showLanguages.map(p => ({
                contents: <TranslationProgressIndicator title={i18n.humanReadableLocale(p.language)}
                                                        data={p.completionData}/>,
                onClick: () => translationClicked(p.language)
            }))}/>
        </Container>
    </div>
}