import React, { Component } from "react";
import { Route, Routes } from "react-router-dom";
import AppRoutes from "./AppRoutes";
import Layout from "./components/Layout";
import "./custom.css";
import Styles from "./App.module.css";
import { useTranslation } from "react-i18next";
import i18n from "./helpers/i18n";
import { ServerInformationProvider } from "./context/ServerInformationContext";
import { TextDirection } from "@/interfaces/misc";

function ErrorIndicator({ error }: { error: any }) {
    const { t } = useTranslation();

    return (
        <div className={Styles.errorContainer}>
            {t("Sorry, an error occurred.")}
        </div>
    );
}

interface AppProps {}

interface AppState {
    error: any;
    dir: TextDirection;
}

export default class App extends Component<AppProps, AppState> {
    static displayName = App.name;

    constructor(props: AppProps) {
        super(props);

        this.state = {
            error: null,
            dir: i18n.dir(),
        };

        i18n.on("languageChanged", () => {
            this.setState({
                dir: i18n.dir(),
            });
        });
    }

    render() {
        if (this.state.error) {
            return <ErrorIndicator error={this.state.error} />;
        }

        return (
            <ServerInformationProvider>
                <React.Suspense fallback={<div></div>}>
                    <Layout dir={this.state.dir}>
                        <Routes>
                            {AppRoutes.map((route, index) => {
                                const { element, ...rest } = route;
                                return (
                                    <Route
                                        key={index}
                                        {...rest}
                                        element={element}
                                    />
                                );
                            })}
                        </Routes>
                    </Layout>
                </React.Suspense>
            </ServerInformationProvider>
        );
    }

    componentDidCatch(error: any, errorInfo: any) {
        console.log(error);
        this.setState({
            error: error,
        });
    }
}
