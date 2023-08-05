import Styles from "./PreloadingBlock.module.css";

export default function PreloadingBlock({className, children, width = 100}) {
    let style = {};
    if (width) style.width = `${width}%`;
    
    return <div className={`${className || ""} ${Styles.preloadingBlock}`} style={style}>
        {children}
    </div>
}