import React, {Component} from 'react';
import {Route, Routes} from 'react-router-dom';
import AppRoutes from './AppRoutes';
import {Layout} from './components/Layout';
import './custom.css';
import Styles from './App.module.css';
import {useTranslation} from "react-i18next";

function ErrorIndicator({error}) {
    const {t} = useTranslation();

    return <div className={Styles.errorContainer}>
        {t("Sorry, an error occurred.")}
    </div>
}

export default class App extends Component {
    static displayName = App.name;

    constructor(props) {
        super(props);

        this.state = {
            error: null
        }
    }

    render() {
        if (this.state.error) {
            return <ErrorIndicator error={this.state.error}/>
        }

        return (
            <React.Suspense fallback={<div></div>}>
                <Layout>
                    <Routes>
                        {AppRoutes.map((route, index) => {
                            const {element, ...rest} = route;
                            return <Route key={index} {...rest} element={element}/>;
                        })}
                    </Routes>
                </Layout>
            </React.Suspense>
        );
    }

    componentDidCatch(error, errorInfo) {
        console.log(error);
        this.setState({
            error: error
        });
    }
}
