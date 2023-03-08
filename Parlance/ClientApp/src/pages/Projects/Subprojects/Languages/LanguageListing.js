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
import {VerticalSpacer} from "../../../../components/Layouts";
import BackButton from "../../../../components/BackButton";
import ErrorCover from "../../../../components/ErrorCover";
import Hero from "../../../../components/Hero";

export default function LanguageListing() {
    const [ignored, forceUpdate] = useReducer(x => x + 1, 0);
    const {project, subproject} = useParams();
    const [subprojectData, setSubprojectData] = useState({});
    const [languages, setLanguages] = useState([]);
    const [done, setDone] = useState(false);
    const [error, setError] = useState();
    const navigate = useNavigate();
    const {t} = useTranslation();

    UserManager.on("currentUserChanged", forceUpdate);

    const updateProjects = async () => {
        try {
            let subprojectData = await Fetch.get(`/api/projects/${project}/${subproject}`);
            setSubprojectData(subprojectData);
            setLanguages(subprojectData.availableLanguages);
            setDone(true);
        } catch (err) {
            setError(err);
        }
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

    const myLanguages = UserManager.currentUser?.languagePermissions && showLanguages.filter(lang => UserManager.currentUser.languagePermissions.includes(lang.language));
    const otherLanguages = UserManager.currentUser?.languagePermissions ? showLanguages.filter(lang => !UserManager.currentUser.languagePermissions.includes(lang.language)) : showLanguages;

    return <div>
        <Hero heading={subprojectData?.projectName} subheading={subprojectData?.name} buttons={[]}/>
        <BackButton text={t("BACK_TO_SUBPROJECTS")} onClick={() => navigate("../..")}/>
        <VerticalSpacer/>
        <ErrorCover error={error}>
            {myLanguages &&
                <>
                    <Container>
                        <PageHeading level={3}>{t("MY_LANGUAGES")}</PageHeading>
                        <SelectableList items={done ? myLanguages.map(p => ({
                            contents: <TranslationProgressIndicator title={i18n.humanReadableLocale(p.language)}
                                                                    badges={subprojectData.preferRegionAgnosticLanguage && i18n.isRegionAgnostic(p.language) ? [t("PREFERRED")] : []}
                                                                    data={p.completionData}/>,
                            onClick: () => translationClicked(p.language)
                        })) : TranslationProgressIndicator.PreloadContents()}/>
                    </Container>
                    <VerticalSpacer/>
                </>
            }
            <Container>
                <PageHeading level={3}>{myLanguages ? t("OTHER_LANGUAGES") : t("AVAILABLE_LANGUAGES")}</PageHeading>
                <SelectableList items={done ? otherLanguages.map(p => ({
                    contents: <TranslationProgressIndicator title={i18n.humanReadableLocale(p.language)}
                                                            badges={subprojectData.preferRegionAgnosticLanguage && i18n.isRegionAgnostic(p.language) ? [t("PREFERRED")] : []}
                                                            data={p.completionData}/>,
                    onClick: () => translationClicked(p.language)
                })) : TranslationProgressIndicator.PreloadContents()}/>
            </Container>
        </ErrorCover>
    </div>
}