import Styles from "./CopyContainer.module.css";
import Icon from "@/components/Icon";

export function CopyContainer({ text }: { text: string }) {
    return (
        <div className={Styles.container}>
            <pre>{text}</pre>
            <div
                className={Styles.copyButton}
                onClick={() => navigator.clipboard.writeText(text)}
            >
                <Icon icon={"edit-copy"} />
            </div>
        </div>
    );
}
