import React, {Component, useEffect, useState} from 'react';
import Styles from './NavMenu.module.css';
import Button from "./Button";
import Modal from "./Modal";
import LoginUsernameModal from "./modals/account/LoginUsernameModal";
import UserManager from "../helpers/UserManager";
import UserModal from "./modals/account/UserModal";
import {useTranslation} from "react-i18next";
import {useNavigate} from "react-router-dom";

export default function(props) {
    const [currentUser, setCurrentUser] = useState();
    const {t} = useTranslation();
    const navigate = useNavigate();

    UserManager.on("currentUserChanged", () => {
        setCurrentUser(UserManager.currentUser?.username || t("LOG_IN"))
    });
    useEffect(() => {
        setCurrentUser(UserManager.currentUser?.username || t("LOG_IN"))
    });
    
    const manageAccount = () => {
        if (UserManager.isLoggedIn) {
            Modal.mount(<UserModal navigate={navigate} />)
        } else {
            UserManager.clearLoginDetails();
            Modal.mount(<LoginUsernameModal />)
        }
    };
    const goHome = () => {
        navigate("/");
    };

    return (
        <header>
            <div className={Styles.navbarWrapper}>
                <div className={Styles.navbarInner}>
                    <div>
                        <Button onClick={goHome}>Parlance</Button>
                    </div>
                    <div>
                        <Button onClick={manageAccount}>{currentUser}</Button>
                    </div>
                </div>
            </div>
        </header>
    );
}
