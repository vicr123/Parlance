import Styles from "./SmallButton.module.css"
import {useTabIndex} from "react-tabindex";
import {ReactElement, ReactNode} from "react";

interface SmallButtonProps {
    children: ReactNode
    onClick?: () => void
    tabIndex?: number
}

export default function SmallButton({children, onClick, tabIndex}: SmallButtonProps): ReactElement {
    tabIndex = useTabIndex(tabIndex);

    return <div onClick={onClick} className={Styles.smallButton} tabIndex={tabIndex}>
        {children}
    </div>
}