import Styles from "./ListPage.module.css";
import {Route, Routes, useLocation, useNavigate} from "react-router-dom";

function toUrl(name) {
    return name.toLowerCase().replace(" ", "-")
}

function ListItem(props) {
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

export default function ListPage({items}) {
    return <div className={Styles.parent}>
        <div className={Styles.leftPane}>
            {items.map((item, i) => {
                if (typeof (item) === "string") {
                    return <b key={i} className={Styles.listItem}>{item.toUpperCase()}</b>
                } else {
                    return <ListItem key={i} {...item} />
                }
            })}
        </div>
        <div className={Styles.rightPane}>
            <Routes>
                {items.filter(item => typeof (item) === "object").map((item, index) => {
                    return <Route key={index} path={`/${toUrl(item.name)}/*`} element={item.render}/>
                })}
            </Routes>
        </div>
    </div>
}