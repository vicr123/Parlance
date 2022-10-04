import Container from "./Container";
import Styles from "./BackButton.module.css"
import Icon from "./Icon";
import {HorizontalLayout} from "./Layouts";
import {useTranslation} from "react-i18next";

export default function BackButton({onClick, inListPage, text}) {
    const {t} = useTranslation();

    if (!text) text = t("BACK");

    const child = <HorizontalLayout>
        <Icon icon={"go-previous"}/>{text}
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