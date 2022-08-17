import Styles from "./Container.module.css";

export default function Container(props) {
    let styles = [Styles.container];
    if (props.bottomBorder) styles.push(Styles.bottomBorder);
    styles.push(props.className);
    
    return <div className={styles.join(" ")} style={props.style} onClick={props.onClick}>
        <div className={Styles.containerInner}>
            {props.children}
        </div>
    </div>
}