import Styles from "./Container.module.css";

export default function Container(props) {
    return <div className={Styles.container}>
        <div className={Styles.containerInner}>
            {props.children}
        </div>
    </div>
}