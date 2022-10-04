import Styles from "./Button.module.css";

export default function (props) {
    return <div className={[Styles.button, props.disabled ? Styles.disabled : null].join(" ")} {...props}>
        {props.children}
    </div>
}