import Styles from "./Layouts.module.css"

export function VerticalLayout({children, gap = 6}) {
    return <div className={Styles.verticalLayout} style={{
        gap: `${gap}px`
    }}>
        {children}
    </div>
}

export function VerticalSpacer({children, height = 20}) {
    return <div style={{
        height: `${height}px`
    }}>
        {children}
    </div>
}

export function HorizontalLayout({children, gap = 6}) {
    return <div className={Styles.horizontalLayout} style={{
        gap: `${gap}px`
    }}>
        {children}
    </div>
}