import Styles from "./SilentInformation.module.css";

export default function SilentInformation({title, text, className = ""}) {
    return <div className={`${Styles.silentInformation} ${className}`}>
        <span className={Styles.title}>{title}</span>
        <span className={Styles.text}>{text}</span>
    </div>
}