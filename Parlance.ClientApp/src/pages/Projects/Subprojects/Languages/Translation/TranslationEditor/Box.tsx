import {HTMLAttributes, ReactNode } from "react";
import Styles from "./Box.module.css"

export function Box(props: HTMLAttributes<HTMLDivElement>) {
    return <div {...props} className={`${props.className} ${Styles.box}`}>
        {props.children}
    </div>
}
