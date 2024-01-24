import Styles from "./ErrorText.module.css"

interface ErrorTextProps {
    error?: string
}

export default function ErrorText({error}: ErrorTextProps) {
    return error && <span className={Styles.error}>{error}</span>
}
