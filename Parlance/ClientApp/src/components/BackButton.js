import Container from "./Container";
import Styles from "./BackButton.module.css"
import Icon from "./Icon";
import {HorizontalLayout} from "./Layouts";

export default function({onClick, inListPage}) {
    const child = <HorizontalLayout>
        <Icon icon={"go-previous"} />Back
    </HorizontalLayout>;
    
    if (inListPage) {
        return <div className={`${Styles.listPageContainer} ${Styles.backButton}`} onClick={onClick}>
            {child}
        </div>;
    } else {
        return <Container onClick={onClick} className={Styles.backButton} bottomBorder={true}>
            {child}
        </Container>
    }
    
}