import Styles from "./WallMessage.module.css";
import Container from "./Container";
import {VerticalLayout} from "./Layouts";
import PageHeading from "./PageHeading";

export default function WallMessage({message, title}) {
    return <Container bottomBorder={true} className={Styles.wallMessage}>
        <VerticalLayout>
            <PageHeading level={3}>{title}</PageHeading>
            <span>{message}</span>
        </VerticalLayout>
    </Container>
}