import Styles from "./PageHeading.module.css";
import {ReactElement, ReactNode} from "react";

interface PageHeadingProps {
    level: 1 | 2 | 3;
    children: ReactNode;
    className?: string;
}

export default function PageHeading(props: PageHeadingProps): ReactElement {
    switch (props.level) {
        case 2:
            return <h2 className={`${Styles.level2} ${props.className}`}>{props.children}</h2>
        case 3:
            return <h3 className={`${Styles.level3} ${props.className}`}>{props.children}</h3>
        default:
            return <h1 className={`${Styles.level1} ${props.className}`}>{props.children}</h1>
    }
}