import React from "react";
import Styles from "./ModalList.module.css";

interface ModalListProps {
    children?: ModalListItem | ModalListItem[];
}

type ModalListItem = ModalListItemInterface | undefined;

interface ModalListItemInterface {
    type?: "destructive";
    onClick: () => void;
    dir?: "rtl" | "ltr";
    text: string;
}

function ModalList({ children }: ModalListProps) {
    let items: ModalListItem[] | undefined;
    if (children instanceof Array) {
        items = children;
    } else if (!children) {
        items = children;
    } else {
        items = [children];
    }

    return (
        <div className={Styles.ModalList}>
            {items?.map((item, index) => {
                if (!item) return null;

                let styles = [Styles.ModalListItem];
                if (item.type === "destructive")
                    styles.push(Styles.DestructiveListItem);
                return (
                    <div
                        key={index}
                        className={styles.join(" ")}
                        onClick={item.onClick}
                        dir={item.dir || "ltr"}
                    >
                        {item.text}
                    </div>
                );
            })}
        </div>
    );
}

ModalList.displayName = "ModalList";

export default ModalList;
