import Styles from "./KeyboardShortcut.module.css";

function KeyboardShortcutPart({text}) {
    return <div className={Styles.shortcut}>
        {text}
    </div>
}

export default function KeyboardShortcut({shortcut}) {
    let isMac = navigator.userAgent.toLowerCase().includes("mac");
    const resolvedShortcut = shortcut[0].map(key => {
        if (isMac) {
            switch (key) {
                case "Control":
                    return "⌘";
                case "Alt":
                    return "⌥";
                case "Shift":
                    return "⇧";
                case "Enter":
                    return "↵";
                case "Backspace":
                    return "⌫";
            }
        }

        switch (key) {
            case "Control":
                return "CTRL";
            case "Alt":
                return "ALT";
            case "Shift":
                return "SHIFT";
            case "ArrowLeft":
                return "←";
            case "ArrowDown":
                return "↓";
            case "ArrowRight":
                return "→";
            case "ArrowUp":
                return "↑";
            default:
                return key;
        }
    });

    return <div className={Styles.shortcutContainer}>
        {resolvedShortcut.map((key, i) => <KeyboardShortcutPart text={key} key={i}/>)}
    </div>
}