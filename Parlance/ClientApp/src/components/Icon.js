import Styles from "./Icon.module.css";

const commitish = "v1.10";

export default function({icon}) {
    let content = `https://cdn.jsdelivr.net/gh/vicr123/contemporary-icons@${commitish}/actions/16/${icon}.svg`;
    return <img className={Styles.icon} alt={icon} src={content} />
}