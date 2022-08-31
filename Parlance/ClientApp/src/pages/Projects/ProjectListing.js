import Container from "../../components/Container";
import PageHeading from "../../components/PageHeading";
import {useEffect, useState} from "react";
import Fetch from "../../helpers/Fetch";
import SelectableList from "../../components/SelectableList";
import {useNavigate} from "react-router-dom";
import i18n from "../../helpers/i18n";
import TranslationProgressIndicator from "../../components/TranslationProgressIndicator";

export default function(props) {
    const [projects, setProjects] = useState([]);
    const navigate = useNavigate();

    const updateProjects = async () => {
        setProjects(await Fetch.get("/api/projects"));
    };

    useEffect(() => {
        updateProjects();
    }, []);

    return <div>
        <Container>
            <PageHeading level={3}>Available Projects</PageHeading>
            <SelectableList items={projects.map(p => ({
                contents: <TranslationProgressIndicator title={i18n.humanReadableLocale(p.name)} data={p.completionData} />,
                onClick: () => navigate(p.systemName)
            }))} />
        </Container>
    </div>
}