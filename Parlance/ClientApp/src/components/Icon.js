import Styles from "./Icon.module.css";

const commitish = "v1.10";

export default function Icon({icon, flip, className}) {
    let content = `https://cdn.jsdelivr.net/gh/vicr123/contemporary-icons@${commitish}/actions/16/${icon}.svg`;
    return <img className={`${Styles.icon} ${flip && Styles.flipIcon} ${className}`} alt={icon} src={content}/>
}