import Styles from "./Container.module.css";
import {CSSProperties, ReactNode} from "react";

interface ContainerProps {
    onClick?: () => void;
    style?: CSSProperties;
    className?: string;
    bottomBorder?: boolean;
    children: ReactNode;
}

export default function Container(props: ContainerProps) {
    let styles = [Styles.container];
    if (props.bottomBorder) styles.push(Styles.bottomBorder);
    if (props.className) styles.push(props.className);
    
    return <div className={styles.join(" ")} style={props.style} onClick={props.onClick}>
        <div className={Styles.containerInner}>
            {props.children}
        </div>
    </div>
}
