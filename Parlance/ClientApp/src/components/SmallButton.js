import Styles from "./SmallButton.module.css"
import {useTabIndex} from "react-tabindex";

export default function SmallButton({children, onClick, tabIndex}) {
    tabIndex = useTabIndex(tabIndex);

    return <div onClick={onClick} className={Styles.smallButton} tabIndex={tabIndex}>
        {children}
    </div>
}