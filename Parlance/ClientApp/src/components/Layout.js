import React from 'react';
import NavMenu from './NavMenu';
import Styles from "./Layout.module.css";

export default function Layout({dir, children}) {
    return <div className={`${Styles.rootLayout} ${dir}`} dir={dir}>
        <NavMenu/>
        {children}
    </div>
}