import Container from "../components/Container";
import PageHeading from "../components/PageHeading";

export default function(props) {
    return <div>
        <Container>
            <PageHeading level={1}>Are you lost?</PageHeading>
            <p>Looks like you're lost.</p>
        </Container>
    </div>
}