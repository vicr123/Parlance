import Styles from "./KeyboardShortcut.module.css";

function KeyboardShortcutPart({text}) {
    return <div className={Styles.shortcut}>
        {text}
    </div>
}

export default function KeyboardShortcut({shortcut}) {
    return <div className={Styles.shortcutContainer}>
        {shortcut.map((key, i) => <KeyboardShortcutPart text={key} key={i}/>)}
    </div>
}