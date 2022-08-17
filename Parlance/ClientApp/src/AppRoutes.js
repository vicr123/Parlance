import {Counter} from "./components/Counter";
import {FetchData} from "./components/FetchData";
import {Home} from "./pages/Home";
import Administration from "./pages/Administration";
import Account from "./pages/Account";

const AppRoutes = [
    {
        index: true,
        element: <Home/>
    },
    {
        path: "/admin/*",
        element: <Administration />
    },
    {
        path: "/account/*",
        element: <Account />
    }
];

export default AppRoutes;
