import Styles from "./PreloadingBlock.module.css";
import { CSSProperties, ReactElement, ReactNode } from "react";

interface PreloadingBlockProps {
    className?: string;
    children?: ReactNode;
    width?: number | null;
}

export default function PreloadingBlock({
    className,
    children,
    width = 100,
}: PreloadingBlockProps): ReactElement {
    let style: CSSProperties = {};
    if (width) style.width = `${width}%`;

    return (
        <div
            className={`${className || ""} ${Styles.preloadingBlock}`}
            style={style}
        >
            {children}
        </div>
    );
}
