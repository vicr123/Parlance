import Styles from "./LineEdit.module.css";
import {useId} from "react";

export default function(props) {
    const id = useId();
    
    let inputProps = {...props};
    inputProps.placeholder = "";
    inputProps.style = {};
    
    return <div style={props.style}>
        <div className={Styles.container}>
            <input className={Styles.input} type={props.password ? "password" : "text"} required={true} id={id} {...inputProps} />
            <label className={Styles.label} htmlFor={id}>{props.placeholder}</label>
        </div>
    </div>
}