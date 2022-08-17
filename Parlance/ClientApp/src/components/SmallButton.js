import Styles from "./SmallButton.module.css"

export default function(props) {
    return <div onClick={props.onClick} className={Styles.smallButton}>
        {props.children}
    </div>
}