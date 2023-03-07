import {useNavigate, useParams} from "react-router-dom";
import React, {useEffect, useReducer, useState} from "react";
import Fetch from "../../helpers/Fetch";
import Container from "../../components/Container";
import PageHeading from "../../components/PageHeading";
import SelectableList from "../../components/SelectableList";
import i18n from "../../helpers/i18n";
import TranslationProgressIndicator from "../../components/TranslationProgressIndicator";
import UserManager from "../../helpers/UserManager";
import Modal from "../../components/Modal";
import {useTranslation} from "react-i18next";
import ErrorModal from "../../components/modals/ErrorModal";
import LoadingModal from "../../components/modals/LoadingModal";
import {VerticalSpacer} from "../../components/Layouts";
import BackButton from "../../components/BackButton";
import ErrorCover from "../../components/ErrorCover";
import Hero from "../../components/Hero";
import PreloadingBlock from "../../components/PreloadingBlock";
import LoginUsernameModal from "../../components/modals/account/LoginUsernameModal";

export default function ServerLanguageProjectListing() {
    const [ignored, forceUpdate] = useReducer(x => x + 1, 0);
    const {language} = useParams();
    const [subprojectData, setSubprojectData] = useState([]);
    const [done, setDone] = useState(false);
    const [error, setError] = useState();
    const navigate = useNavigate();
    const {t} = useTranslation();

    UserManager.on("currentUserChanged", forceUpdate);

    const updateProjects = async () => {
        try {
            let subprojectData = await Fetch.get(`/api/projects/languages/${language}`);
            setSubprojectData(subprojectData);
            setDone(true);
        } catch (err) {
            setError(err);
        }
    };

    useEffect(() => {
        updateProjects();
    }, []);


    const translationClicked = (project, subproject) => {
        if (subproject.completionData) {
            navigate(`../../projects/${project.systemName}/${subproject.systemName}/${language}`);
        } else {
            if (!UserManager.isLoggedIn) {
                Modal.mount(<Modal heading={t("NOT_LOGGED_IN")} buttons={[
                    {
                        text: t("LOG_IN"),
                        onClick: () => {
                            Modal.mount(<LoginUsernameModal />)
                        }
                    },
                    Modal.OkButton
                ]}>
                    {t("START_NEW_TRANSLATION_LOGIN_REQUIRED")}
                </Modal>)
                return;
            }

            Modal.mount(<Modal heading={t("START_NEW_TRANSLATION")} buttons={[
                Modal.CancelButton,
                {
                    text: t("START_NEW_TRANSLATION_CREATE_TRANSLATION_FILE"),
                    onClick: async () => {
                        Modal.mount(<LoadingModal/>);

                        try {
                            await Fetch.post(`/api/projects/${project.systemName}/${subproject.systemName}/${language}`, {});
                            navigate(`../../${project.systemName}/${subproject.systemName}/${language}`);
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
        <Hero heading={i18n.humanReadableLocale(language)} buttons={[]}/>
        <BackButton text={t("BACK_TO_LANGUAGES")} onClick={() => navigate("../")}/>
        <VerticalSpacer/>
        <ErrorCover error={error}>
            {done ? subprojectData.map(project =>
                <>
                    <ErrorCover error={project.error}>
                        <Container>
                            <PageHeading level={3}>{project.name}</PageHeading>
                            <SelectableList items={project.subprojects.map(sp => ({
                                contents: <TranslationProgressIndicator title={sp.name}
                                                                        data={sp.completionData}
                                                                        deadline={project.deadline}
                                />,
                                onClick: () => translationClicked(project, sp)
                            }))}/>
                        </Container>
                    </ErrorCover>
                    <VerticalSpacer/>
                </>
            ) : [1, 2, 3].map(() => <Container>
                <PageHeading level={3}><PreloadingBlock width={20}>TEXT</PreloadingBlock></PageHeading>
                    <SelectableList items={TranslationProgressIndicator.PreloadContents()}/>
                    <VerticalSpacer/>
                </Container>)
            }
        </ErrorCover>
    </div>
}