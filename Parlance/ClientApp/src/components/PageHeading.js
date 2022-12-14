import Styles from "./PageHeading.module.css";

export default function(props) {
    switch (props.level) {
        case 2:
            return <h2 className={Styles.level2}>{props.children}</h2>
        case 3:
            return <h3 className={Styles.level3}>{props.children}</h3>
        default:
            return <h1 className={Styles.level1}>{props.children}</h1>
    }
}