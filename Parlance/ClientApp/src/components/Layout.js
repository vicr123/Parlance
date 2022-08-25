import React, {Component} from 'react';
import NavMenu from './NavMenu';
import Styles from "./Layout.module.css";

export class Layout extends Component {
    static displayName = Layout.name;

    render() {
        return (
            <div className={Styles.rootLayout}>
                <NavMenu/>
                {this.props.children}
            </div>
        );
    }
}
