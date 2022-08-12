import Styles from "./PageContainer.module.css"

export default function(props) {
    return <div className={Styles.pageContainer}>
        {props.children}
    </div>
}