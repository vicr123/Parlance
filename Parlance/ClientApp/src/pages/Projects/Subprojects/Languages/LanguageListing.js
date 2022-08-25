import {useNavigate, useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import Fetch from "../../../../helpers/Fetch";
import Container from "../../../../components/Container";
import PageHeading from "../../../../components/PageHeading";
import SelectableList from "../../../../components/SelectableList";
import i18n from "../../../../helpers/i18n";

export default function(props) {
    const {project, subproject} = useParams();
    const [languages, setLanguages] = useState([]);
    const navigate = useNavigate();

    const updateProjects = async () => {
        let subprojectData = await Fetch.get(`/api/projects/${project}/${subproject}`);
        setLanguages(subprojectData.availableLanguages);
    };

    useEffect(() => {
        updateProjects();
    });
    
    return <div>
        <Container>
            <PageHeading level={3}>Available Languages</PageHeading>
            <SelectableList items={languages.map(p => ({
                contents: i18n.humanReadableLocale(p.language),
                onClick: () => navigate(p.language)
            }))} />
        </Container>
    </div>
}