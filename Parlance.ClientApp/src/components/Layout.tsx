import React, { ReactNode } from "react";
import NavMenu from "./NavMenu";
import Styles from "./Layout.module.css";
import Footer from "./Footer";

export default function Layout({
    dir,
    children,
}: {
    dir: "ltr" | "rtl";
    children: ReactNode;
}) {
    return (
        <div className={`${Styles.rootLayout} ${dir}`} dir={dir}>
            <NavMenu />
            {children}
            <Footer />
        </div>
    );
}
