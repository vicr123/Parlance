import {Counter} from "./components/Counter";
import {FetchData} from "./components/FetchData";
import {Home} from "./pages/Home";
import Administration from "./pages/Administration";
import Account from "./pages/Account";
import Projects from "./pages/Projects";
import UnknownPage from "./pages/UnknownPage";

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
    },
    {
        path: "/projects/*",
        element: <Projects />
    },
    {
        path: "*",
        element: <UnknownPage />
    }
];

export default AppRoutes;
