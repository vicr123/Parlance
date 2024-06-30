import Styles from "./LineEdit.module.css";
import { HTMLProps, useId, useRef } from "react";

interface LineEditProps extends HTMLProps<HTMLInputElement> {
    password?: boolean;
}

export default function LineEdit(props: LineEditProps) {
    const id = useId();
    const input = useRef<HTMLInputElement>(null);

    let inputProps = { ...props };
    inputProps.placeholder = "";
    inputProps.style = {};
    inputProps.password = false;

    return (
        <div style={props.style}>
            <div
                className={Styles.container}
                onClick={() => input.current?.focus()}
            >
                <input
                    className={Styles.input}
                    type={props.password ? "password" : "text"}
                    required={true}
                    id={id}
                    ref={input}
                    {...inputProps}
                />
                <label className={Styles.label} htmlFor={id}>
                    {props.placeholder}
                </label>
                <div className={Styles.focusDecoration} />
            </div>
        </div>
    );
}
