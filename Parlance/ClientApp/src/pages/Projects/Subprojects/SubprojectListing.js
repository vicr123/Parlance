import {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import Fetch from "../../../helpers/Fetch";
import Container from "../../../components/Container";
import PageHeading from "../../../components/PageHeading";
import SelectableList from "../../../components/SelectableList";
import i18n from "../../../helpers/i18n";
import TranslationProgressIndicator from "../../../components/TranslationProgressIndicator";

export default function SubprojectListing(props) {
    const {project} = useParams();
    const [projectData, setProjectData] = useState();
    const navigate = useNavigate();

    const updateProjects = async () => {
        setProjectData(await Fetch.get(`/api/projects/${project}`));
    };

    useEffect(() => {
        updateProjects();
    }, []);

    return <div>
        <Container>
            <PageHeading level={3}>Available Subprojects</PageHeading>
            <SelectableList items={projectData?.subprojects?.map(p => ({
                contents: <TranslationProgressIndicator title={i18n.humanReadableLocale(p.name)} data={p.completionData} />,
                onClick: () => navigate(p.systemName)
            }))} />
        </Container>
    </div>
}