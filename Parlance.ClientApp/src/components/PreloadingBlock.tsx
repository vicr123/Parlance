import Styles from "./PreloadingBlock.module.css";
import { CSSProperties, ReactElement, ReactNode } from "react";

interface PreloadingBlockProps {
    className?: string;
    children?: ReactNode;
    width?: number | "auto" | null;
}

export default function PreloadingBlock({
    className,
    children,
    width = 100,
}: PreloadingBlockProps): ReactElement {
    let style: CSSProperties = {};
    if (width) {
        if (width === "auto") {
            style.width = "auto";
        } else {
            style.width = `${width}%`;
        }
    }

    return (
        <div
            className={`${className || ""} ${Styles.preloadingBlock}`}
            style={style}
        >
            {children}
        </div>
    );
}
