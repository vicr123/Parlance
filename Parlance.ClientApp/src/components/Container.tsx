import Styles from "./Container.module.css";
import { CSSProperties, ReactNode } from "react";

interface ContainerProps {
    onClick?: () => void;
    style?: CSSProperties;
    className?: string;
    bottomBorder?: boolean;
    children: ReactNode;
}

export default function Container(props: ContainerProps) {
    let styles = [Styles.container];
    // if (props.bottomBorder) styles.push(Styles.bottomBorder);

    let innerStyles = [Styles.containerInner];
    if (props.className) innerStyles.push(props.className);

    return (
        <div className={styles.join(" ")}>
            <div
                className={innerStyles.join(" ")}
                style={props.style}
                onClick={props.onClick}
            >
                {props.children}
            </div>
        </div>
    );
}
