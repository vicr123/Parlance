import {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import Fetch from "../../../helpers/Fetch";
import Container from "../../../components/Container";
import PageHeading from "../../../components/PageHeading";
import SelectableList from "../../../components/SelectableList";

export default function(props) {
    const {project} = useParams();
    const [subprojects, setSubprojects] = useState([]);
    const navigate = useNavigate();

    const updateProjects = async () => {
        setSubprojects(await Fetch.get(`/api/projects/${project}`));
    };

    useEffect(() => {
        updateProjects();
    });

    return <div>
        <Container>
            <PageHeading level={3}>Available Subprojects</PageHeading>
            <SelectableList items={subprojects.map(p => ({
                contents: p.name,
                onClick: () => navigate(p.systemName)
            }))} />
        </Container>
    </div>
}