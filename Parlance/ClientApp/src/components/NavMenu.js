import React, {Component} from 'react';
import Styles from './NavMenu.module.css';
import Button from "./Button";
import Modal from "./Modal";
import LoginUsernameModal from "./modals/account/LoginUsernameModal";
import UserManager from "../helpers/UserManager";
import UserModal from "./modals/account/UserModal";

export class NavMenu extends Component {
    static displayName = NavMenu.name;

    constructor(props) {
        super(props);

        this.toggleNavbar = this.toggleNavbar.bind(this);
        this.state = {
            collapsed: true
        };
    }

    toggleNavbar() {
        this.setState({
            collapsed: !this.state.collapsed
        });
    }
    
    manageAccount() {
        if (UserManager.isLoggedIn) {
            Modal.mount(<UserModal />)
        } else {
            UserManager.clearLoginDetails();
            Modal.mount(<LoginUsernameModal />)
        }
    }

    render() {
        return (
            <header>
                <div className={Styles.navbarWrapper}>
                    <div className={Styles.navbarInner}>
                        <div>
                            Parlance
                        </div>
                        <div>
                            <Button onClick={this.manageAccount.bind(this)}>Log In</Button>
                        </div>
                    </div>
                </div>
            </header>
        );
    }
}
