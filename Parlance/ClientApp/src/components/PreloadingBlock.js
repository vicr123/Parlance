import Styles from "./PreloadingBlock.module.css";

export default function PreloadingBlock({className, children, width = 100}) {
    return <div className={`${className || ""} ${Styles.preloadingBlock}`} style={{
        width: `${width}%`
    }}>
        {children}
    </div>
}