import Container from "./Container";
import Styles from "./BackButton.module.css"
import Icon from "./Icon";
import {HorizontalLayout} from "./Layouts";

export default function({onClick}) {
    return <Container onClick={onClick} className={Styles.backButton} bottomBorder={true}>
        <HorizontalLayout>
            <Icon icon={"go-previous"} />Back
        </HorizontalLayout>
    </Container>
}