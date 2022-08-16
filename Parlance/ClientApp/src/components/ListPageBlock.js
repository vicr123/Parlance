import Styles from "./ListPageBlock.module.css";

export default function(props) {
    return <div className={Styles.listPageBlock}>
        {props.children}
    </div>
}