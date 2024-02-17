import React, {ReactNode} from 'react';
import Styles from './Modal.module.css';
import {createRoot, Root} from "react-dom/client";
import {WithTranslation, withTranslation} from "react-i18next";
import i18n from "../helpers/i18n";
import Icon from "./Icon";
import {TFunctionResult} from "i18next";

let root: Root | null;

interface ModalButton {
    destructive?: boolean
    onClick?: () => void
    text: string
}

interface ModalProps {
    popover?: any
    buttons?: ModalButton[]
    onButtonClick?: () => {}
    children?: ReactNode | TFunctionResult
    onBackClicked?: () => void
    heading?: string
    topComponent?: ReactNode
}

interface ModalExportButtons {
    CancelButton: ModalButton;
    OkButton: ModalButton;
}

interface ModalExports extends React.FunctionComponent<ModalProps>, ModalExportButtons {
    mount: (modal: React.ReactElement) => void;
    unmount: () => void;
    ModalProgressSpinner: typeof ModalProgressSpinner
}

interface ModalProgressSpinnerProps {
    message?: string;
}

function Modal({heading, topComponent, popover, onBackClicked, buttons, children}: ModalProps) {
    // @ts-ignore
    let modalText = React.Children.toArray(children).filter(child => child.type?.displayName !== "ModalList");
    // @ts-ignore
    let modalList = React.Children.toArray(children).filter(child => child.type?.displayName === "ModalList");

    return <div
        className={`${Styles.ModalBackground} ${i18n.dir()} ${popover && Styles.PopoverBackground}`}
        dir={i18n.dir()}>
        <div className={`${Styles.ModalContainer} ${popover && Styles.PopoverContainer}`}>
            {heading && <div className={Styles.ModalHeading}>
                {popover &&
                    <div className={Styles.BackButton} onClick={onBackClicked}><Icon icon={"go-previous"}
                                                                                     flip={true}/></div>}
                <span className={Styles.HeadingText}>{heading}</span>
            </div>}
            {topComponent && <div className={Styles.ModalComponent}>
                {topComponent}
            </div>}
            {modalText && <div className={Styles.ModalText}>
                {modalText}
            </div>}
            {modalList}
            <div className={Styles.ModalButtonContainer}>
                {buttons?.map(button => {
                    if (typeof button === "object") {
                        let classes = [Styles.ModalButton];
                        if (button.destructive) classes.push(Styles.DestructiveModalButton);
                        return <div onClick={button.onClick} className={classes.join(" ")}
                                    key={button.text}>{button.text}</div>
                    } else {
                        // deprecated
                        // @ts-ignore
                        return <div onClick={props.onButtonClick?.bind(this, button)}
                                    className={Styles.ModalButton} key={button}>{button}</div>
                    }
                })}
            </div>
        </div>
    </div>
}

function ModalProgressSpinner(props : ModalProgressSpinnerProps) {
    return <div className={Styles.ModalProgressSpinner}>
        {props?.message}
    </div>
}

let setStandardButtons = () => {
    ExportProperty.CancelButton = {
        text: i18n.t('CANCEL'),
        onClick: () => ExportProperty.unmount()
    };
    ExportProperty.OkButton = {
        text: i18n.t('OK'),
        onClick: () => ExportProperty.unmount()
    };
}

i18n.on("initialized", setStandardButtons);
i18n.on("languageChanged", setStandardButtons);
i18n.on("loaded", setStandardButtons);

let ExportProperty = Modal as ModalExports;
ExportProperty.mount = (modal) => {
    if (root) ExportProperty.unmount();
    root = createRoot(document.getElementById('modalContainer')!);
    root.render(
        <React.StrictMode>
            {modal}
        </React.StrictMode>);
}
ExportProperty.unmount = () => {
    root?.unmount();
    root = null;
}
ExportProperty.ModalProgressSpinner = ModalProgressSpinner;
setStandardButtons();

export default ExportProperty;