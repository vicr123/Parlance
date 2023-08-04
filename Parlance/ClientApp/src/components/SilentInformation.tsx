import Styles from "./SilentInformation.module.css";

interface SilentInformationProps {
    title: string
    text: string
    className?: string
}

export default function SilentInformation({title, text, className = ""}: SilentInformationProps) {
    return <div className={`${Styles.silentInformation} ${className}`}>
        <span className={Styles.title}>{title}</span>
        <span className={Styles.text}>{text}</span>
    </div>
}