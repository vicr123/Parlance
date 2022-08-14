import React from 'react';
import Styles from './Modal.module.css';
import {createRoot} from "react-dom/client";
import {withTranslation} from "react-i18next";
import i18n from "../helpers/i18n";

let root;

class Modal extends React.Component {
    render() {
        return <div className={Styles.ModalBackground}>
            <div className={Styles.ModalContainer}>
                {this.renderHeading()}
                {this.renderModalText()}
                {this.renderModalList()}
                <div className={Styles.ModalButtonContainer}>
                    {this.props.buttons?.map(button => {
                        if (typeof button === "object") {
                            return <div onClick={button.onClick} className={Styles.ModalButton} key={button.text}>{button.text}</div>
                        } else {
                            //deprecated
                            return <div onClick={this.props.onButtonClick.bind(this, button)} className={Styles.ModalButton} key={button}>{button}</div>
                        }
                    })}
                </div>
            </div>
        </div>
    }

    renderModalList() {
        let children = React.Children.toArray(this.props.children).filter(child => child.type?.displayName === "ModalList")

        return children.length !== 0 && <>{children}</>
    }

    renderModalText() {
        let children = React.Children.toArray(this.props.children).filter(child => child.type?.displayName !== "ModalList")

        return children.length !== 0 && <div className={Styles.ModalText}>
            {children}
        </div>
    }

    renderHeading() {
        if (this.props.heading) {
            return <div className={Styles.ModalHeading}>
                {this.props.heading}
            </div>
        }
        return null;
    }
}

let ExportProperty = withTranslation()(Modal);

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
setStandardButtons();

ExportProperty.mount = (modal) => {
    if (root) ExportProperty.unmount();
    root = createRoot(document.getElementById('modalContainer'));
    root.render(
        <React.StrictMode>
            {modal}
        </React.StrictMode>);
}
ExportProperty.unmount = () => {
    root.unmount();
    root = null;
}

class ModalProgressSpinner extends React.Component {
    render() {
        return <div className={Styles.ModalProgressSpinner}>
            {this.props?.message}
        </div>
    }
}

ExportProperty.ModalProgressSpinner = ModalProgressSpinner;

export default ExportProperty;