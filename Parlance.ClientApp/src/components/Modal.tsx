import React, { ReactNode } from "react";
import Styles from "./Modal.module.css";
import { createRoot, Root } from "react-dom/client";
import { WithTranslation, withTranslation } from "react-i18next";
import i18n from "../helpers/i18n";
import Icon from "./Icon";
import { TFunctionResult } from "i18next";

let root: Root | null;

interface ModalButton {
    destructive?: boolean;
    onClick?: () => void;
    text: string;
}

interface ModalExportProps {
    popover?: any;
    buttons?: ModalButton[];
    onButtonClick?: () => {};
    children?: ReactNode | TFunctionResult;
    onBackClicked?: () => void;
    heading?: string;
    topComponent?: ReactNode;
}

interface ModalProps extends WithTranslation, ModalExportProps {}

interface ModalState {}

type ModalComponentExportType = new (
    ModalProps: any,
) => React.Component<ModalExportProps, ModalState>;

interface ModalExportButtons {
    CancelButton: ModalButton;
    OkButton: ModalButton;
}

interface ModalExports extends ModalComponentExportType, ModalExportButtons {
    mount: (modal: React.ReactElement) => void;
    unmount: () => void;
    ModalProgressSpinner: typeof ModalProgressSpinner;
}

interface ModalProgressSpinnerProps {
    message?: string;
}

class Modal extends React.Component<ModalProps, ModalState> {
    render() {
        return (
            <div
                className={`${Styles.ModalBackground} ${i18n.dir()} ${this.props.popover && Styles.PopoverBackground}`}
                dir={i18n.dir()}
            >
                <div
                    className={`${Styles.ModalContainer} ${this.props.popover && Styles.PopoverContainer}`}
                >
                    {this.renderHeading()}
                    {this.renderTopComponent()}
                    {this.renderModalText()}
                    {this.renderModalList()}
                    <div className={Styles.ModalButtonContainer}>
                        {this.props.buttons?.map(button => {
                            if (typeof button === "object") {
                                let classes = [Styles.ModalButton];
                                if (button.destructive)
                                    classes.push(Styles.DestructiveModalButton);
                                return (
                                    <div
                                        onClick={button.onClick}
                                        className={classes.join(" ")}
                                        key={button.text}
                                    >
                                        {button.text}
                                    </div>
                                );
                            } else {
                                // deprecated
                                // @ts-ignore
                                return (
                                    <div
                                        onClick={this.props.onButtonClick?.bind(
                                            this,
                                            button,
                                        )}
                                        className={Styles.ModalButton}
                                        key={button}
                                    >
                                        {button}
                                    </div>
                                );
                            }
                        })}
                    </div>
                </div>
            </div>
        );
    }

    private renderModalList() {
        // @ts-ignore
        let children = React.Children.toArray(this.props.children).filter(
            child => child.type?.displayName === "ModalList",
        );

        return children.length !== 0 && <>{children}</>;
    }

    private renderModalText() {
        // @ts-ignore
        let children = React.Children.toArray(this.props.children).filter(
            child => child.type?.displayName !== "ModalList",
        );

        return (
            children.length !== 0 && (
                <div className={Styles.ModalText}>{children}</div>
            )
        );
    }

    private renderHeading() {
        if (this.props.heading) {
            return (
                <div className={Styles.ModalHeading}>
                    {this.props.popover && (
                        <div
                            className={Styles.BackButton}
                            onClick={this.props.onBackClicked}
                        >
                            <Icon icon={"go-previous"} flip={true} />
                        </div>
                    )}
                    <span className={Styles.HeadingText}>
                        {this.props.heading}
                    </span>
                </div>
            );
        }
        return null;
    }

    private renderTopComponent() {
        if (this.props.topComponent) {
            return (
                <div className={Styles.ModalComponent}>
                    {this.props.topComponent}
                </div>
            );
        }
        return null;
    }
}

function ModalProgressSpinner(props: ModalProgressSpinnerProps) {
    return <div className={Styles.ModalProgressSpinner}>{props?.message}</div>;
}

let setStandardButtons = () => {
    ExportProperty.CancelButton = {
        text: i18n.t("CANCEL"),
        onClick: () => ExportProperty.unmount(),
    };
    ExportProperty.OkButton = {
        text: i18n.t("OK"),
        onClick: () => ExportProperty.unmount(),
    };
};

i18n.on("initialized", setStandardButtons);
i18n.on("languageChanged", setStandardButtons);
i18n.on("loaded", setStandardButtons);

let ExportProperty = withTranslation()(Modal) as ModalExports;
ExportProperty.mount = modal => {
    if (root) ExportProperty.unmount();
    root = createRoot(document.getElementById("modalContainer")!);
    root.render(<React.StrictMode>{modal}</React.StrictMode>);
};
ExportProperty.unmount = () => {
    root?.unmount();
    root = null;
};
ExportProperty.ModalProgressSpinner = ModalProgressSpinner;
setStandardButtons();

export default ExportProperty;
