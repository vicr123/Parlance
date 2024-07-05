import Styles from "./ListPageBlock.module.css";
import { ReactElement, ReactNode } from "react";

interface ListPageBlockProps {
    children: ReactNode;
}

export default function ListPageBlock(props: ListPageBlockProps): ReactElement {
    return <div className={Styles.listPageBlock}>{props.children}</div>;
}
