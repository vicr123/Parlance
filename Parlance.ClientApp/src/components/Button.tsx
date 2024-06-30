import Styles from "./Button.module.css";
import { HTMLAttributes, ReactNode } from "react";

interface ButtonProps extends HTMLAttributes<HTMLDivElement> {
    disabled?: boolean;
    children: ReactNode;
}

export default function (props: ButtonProps) {
    return (
        <div
            className={[
                Styles.button,
                props.disabled ? Styles.disabled : null,
            ].join(" ")}
            {...props}
        >
            {props.children}
        </div>
    );
}
