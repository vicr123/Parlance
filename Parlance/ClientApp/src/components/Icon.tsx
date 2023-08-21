import Styles from "./Icon.module.css";
import {ReactElement} from "react";

const commitish = "v1.10";

interface IconProps {
    icon: string;
    flip?: boolean;
    className?: string;
}

export default function Icon({icon, flip, className} : IconProps) : ReactElement {
    let content = `https://cdn.jsdelivr.net/gh/vicr123/contemporary-icons@${commitish}/actions/16/${icon}.svg`;
    return <img className={`${Styles.icon} ${flip && Styles.flipIcon} ${className}`} alt={icon} src={content}/>
}
