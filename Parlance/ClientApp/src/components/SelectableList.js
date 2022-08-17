import Styles from "./SelectableList.module.css"

export default function(props) {
    if (props.children) {
        return <div className={Styles.listContainer}>
            <div className={Styles.listItem} onClick={props.onClick}>{props.children}</div>
        </div>
    } else {
        if (!props.items?.length) return null;

        return <div className={Styles.listContainer}>
            {props.items.map((item, index) => {
                if (typeof(item) === "string") {
                    return <div className={Styles.listSection}>{item}</div>
                } else {
                    return <div className={Styles.listItem} key={index} onClick={item.onClick}>{item.contents}</div>
                }
            })}
        </div>
    }
}