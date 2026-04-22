import React, { ReactNode } from "react";
import NavMenu from "./NavMenu";
import Styles from "./Layout.module.css";
import Footer from "./Footer";
import { useMatch } from "react-router-dom";

export default function Layout({
    dir,
    children,
}: {
    dir: "ltr" | "rtl";
    children: ReactNode;
}) {
    const isInTranslateUi = useMatch(
        "/projects/:project/:subproject/:language/translate/*",
    );

    const classes = [
        Styles.rootLayout,
        dir,
        ...(isInTranslateUi ? [Styles.translate] : []),
    ];

    return (
        <div className={classes.join(" ")} dir={dir}>
            <NavMenu />
            {children}
            <Footer />
        </div>
    );
}
