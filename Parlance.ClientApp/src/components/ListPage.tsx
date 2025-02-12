import Styles from "./ListPage.module.css";
import {
    Outlet,
    Route,
    Routes,
    useLocation,
    useNavigate,
} from "react-router-dom";
import { ReactNode } from "react";
import BackButton from "./BackButton";
import { useTranslation } from "react-i18next";

interface ListPageItemObject {
    name: string;
    slug: string;
    render: ReactNode;
    default?: boolean;
}

type ListPageItem = ListPageItemObject | string;

function ListItem(props: { name: string; slug: string; default?: boolean }) {
    const navigate = useNavigate();
    const location = useLocation();

    const switchPage = () => {
        navigate(props.slug);
    };

    let styles = [Styles.listItem, Styles.listItemClickable];
    if (location.pathname.includes(props.slug)) {
        styles.push(Styles.selected);
    }

    return (
        <div className={styles.join(" ")} onClick={switchPage}>
            {props.name}
        </div>
    );
}

function ListPageInner({
    items,
    isLeftPane,
    additionalContent,
}: {
    items: ListPageItem[];
    isLeftPane: boolean;
    additionalContent?: ReactNode;
}) {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const goBack = () => {
        navigate("..");
    };

    return (
        <div className={Styles.parent}>
            <div className={Styles.widthConstrainer}>
                <div
                    className={`${Styles.leftPane} ${isLeftPane || Styles.desktopOnly}`}
                >
                    {additionalContent}
                    <div className={Styles.leftPaneInner}>
                        {items.map((item, i) => {
                            if (typeof item === "string") {
                                return (
                                    <b key={i} className={Styles.listItem}>
                                        {item.toUpperCase()}
                                    </b>
                                );
                            } else {
                                return <ListItem key={i} {...item} />;
                            }
                        })}
                    </div>
                </div>
                <div
                    className={`${Styles.rightPane} ${isLeftPane && Styles.desktopOnly}`}
                >
                    <div className={Styles.rightPaneInner}>
                        <div className={Styles.mobileOnly}>
                            <BackButton onClick={goBack} text={t("BACK")} />
                        </div>
                        <Outlet />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ListPage({
    items,
    additionalContent,
}: {
    items: ListPageItem[];
    additionalContent?: ReactNode;
}) {
    return (
        <Routes>
            <Route
                element={
                    <ListPageInner
                        items={items}
                        isLeftPane={true}
                        additionalContent={additionalContent}
                    />
                }
                path={"/"}
            >
                {(
                    items.filter(
                        item => typeof item === "object",
                    ) as ListPageItemObject[]
                )
                    .filter(item => item.default)
                    .map(item => (
                        <Route
                            key={"default"}
                            path={`/`}
                            element={item.render}
                        />
                    ))}
            </Route>
            <Route
                element={
                    <ListPageInner
                        items={items}
                        isLeftPane={false}
                        additionalContent={additionalContent}
                    />
                }
            >
                {(
                    items.filter(
                        item => typeof item === "object",
                    ) as ListPageItemObject[]
                ).flatMap((item, index) => {
                    const routes = [
                        <Route
                            key={index}
                            path={`/${item.slug}/*`}
                            element={item.render}
                        />,
                    ];
                    if (item.default)
                        routes.push(
                            <Route
                                key={"default"}
                                path={`/*`}
                                element={item.render}
                            />,
                        );
                    return routes;
                })}
            </Route>
        </Routes>
    );
}
