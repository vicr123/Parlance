import Styles from "./ListPage.module.css";
import {Outlet, Route, Routes, useLocation, useNavigate} from "react-router-dom";
import {ReactNode} from "react";
import BackButton from "./BackButton";
import {useTranslation} from "react-i18next";

interface ListPageItemObject {
    name: string,
    render: ReactNode
    default?: boolean
}

type ListPageItem = ListPageItemObject | string;

function toUrl(name: string) {
    return name.toLowerCase().replace(" ", "-")
}

function ListItem(props: {
    name: string
    default?: boolean
}) {
    const navigate = useNavigate();
    const location = useLocation();

    const switchPage = () => {
        navigate(toUrl(props.name));
    };

    let styles = [Styles.listItem, Styles.listItemClickable]
    if (location.pathname.includes(toUrl(props.name))) {
        styles.push(Styles.selected);
    }

    return <div className={styles.join(" ")} onClick={switchPage}>
        {props.name}
    </div>
}

function ListPageInner({items, isLeftPane}: {
    items: ListPageItem[],
    isLeftPane: boolean
}) {
    const navigate = useNavigate();
    const {t} = useTranslation();
    
    const goBack = () => {
        navigate("..")
    };
    
    return <div className={Styles.parent}>
        <div className={`${Styles.leftPane} ${isLeftPane || Styles.desktopOnly}`}>
            {items.map((item, i) => {
                if (typeof (item) === "string") {
                    return <b key={i} className={Styles.listItem}>{item.toUpperCase()}</b>
                } else {
                    return <ListItem key={i} {...item} />
                }
            })}
        </div>
        <div className={`${Styles.rightPane} ${isLeftPane && Styles.desktopOnly}`}>
            <div className={Styles.mobileOnly}>
                <BackButton inListPage={true} onClick={goBack} text={t("BACK")} />
            </div>
            <Outlet />
        </div>
    </div>
}

export default function ListPage({items}: {
    items: ListPageItem[]
}) {
    return <Routes>
        <Route element={<ListPageInner items={items} isLeftPane={true} />} path={"/"}>
            {(items.filter(item => typeof (item) === "object") as ListPageItemObject[])
                .filter(item => item.default)
                .map(item => <Route key={"default"} path={`/`} element={item.render}/>)}
        </Route>
        <Route element={<ListPageInner items={items} isLeftPane={false} />}>
            {(items.filter(item => typeof (item) === "object") as ListPageItemObject[]).flatMap((item, index) => {
                const routes = [<Route key={index} path={`/${toUrl(item.name)}/*`} element={item.render}/>]
                if (item.default) routes.push(<Route key={"default"} path={`/*`} element={item.render}/>)
                return routes;
            })}
        </Route>
    </Routes>
}