import Styles from "./Layouts.module.css"
import {ReactElement, ReactNode} from "react";

interface LayoutProps {
    children: ReactNode;
    gap?: number;
    className?: string;
}

interface SpacerProps {
    children: ReactNode;
    height?: number;
}

export function VerticalLayout({children, gap = 6, className}: LayoutProps): ReactElement {
    return <div className={`${className} ${Styles.verticalLayout}`} style={{
        gap: `${gap}px`
    }}>
        {children}
    </div>
}

export function VerticalSpacer({children, height = 20}: SpacerProps): ReactElement {
    return <div style={{
        height: `${height}px`
    }}>
        {children}
    </div>
}

export function HorizontalLayout({children, gap = 6}: LayoutProps): ReactElement {
    return <div className={Styles.horizontalLayout} style={{
        gap: `${gap}px`
    }}>
        {children}
    </div>
}