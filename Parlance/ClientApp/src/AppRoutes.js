import {Counter} from "./components/Counter";
import {FetchData} from "./components/FetchData";
import {Home} from "./pages/Home";
import Administration from "./pages/Administration";

const AppRoutes = [
    {
        index: true,
        element: <Home/>
    },
    {
        path: "/admin/*",
        element: <Administration />
    }
];

export default AppRoutes;
