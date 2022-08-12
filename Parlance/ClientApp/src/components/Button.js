import Styles from "./Button.module.css";

export default function (props) {
    return <div className={Styles.button} {...props}>
        {props.children}
    </div>
}