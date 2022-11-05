import Container from "./Container";
import Styles from "./BackButton.module.css"
import Icon from "./Icon";
import {HorizontalLayout} from "./Layouts";
import {useTranslation} from "react-i18next";

export default function BackButton({onClick, inListPage, inTranslationView, text, className}) {
    const {t} = useTranslation();

    if (!text) text = t("BACK");

    const child = <HorizontalLayout>
        <Icon icon={"go-previous"} flip={true}/>{text}
    </HorizontalLayout>;

    if (inListPage) {
        return <div className={`${Styles.listPageContainer} ${Styles.backButton} ${className}`} onClick={onClick}>
            {child}
        </div>;
    } else if (inTranslationView) {
        return <div className={`${Styles.translationViewContainer} ${Styles.backButton} ${className}`}
                    onClick={onClick}>
            {child}
        </div>;
    } else {
        return <Container onClick={onClick} className={`${Styles.backButton} ${className}`} bottomBorder={true}>
            {child}
        </Container>
    }

}