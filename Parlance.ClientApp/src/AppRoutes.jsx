import { Home } from "./pages/Home/index";
import UnknownPage from "./pages/UnknownPage";
import { lazy } from "react";
import Spinner from "./components/Spinner";

const Administration = lazy(() => import("./pages/Administration"));
const Account = lazy(() => import("./pages/Account"));
const Projects = lazy(() => import("./pages/Projects"));
const Languages = lazy(() => import("./pages/Languages"));
const Glossaries = lazy(() => import("./pages/Glossaries"));
const EmailUnsubscribe = lazy(() => import("./pages/EmailUnsubscribe"));

const AppRoutes = [
    {
        index: true,
        element: <Home />,
    },
    {
        path: "/admin/*",
        element: (
            <Spinner.Suspense>
                <Administration />
            </Spinner.Suspense>
        ),
    },
    {
        path: "/account/*",
        element: (
            <Spinner.Suspense>
                <Account />
            </Spinner.Suspense>
        ),
    },
    {
        path: "/projects/*",
        element: (
            <Spinner.Suspense>
                <Projects />
            </Spinner.Suspense>
        ),
    },
    {
        path: "/languages/*",
        element: (
            <Spinner.Suspense>
                <Languages />
            </Spinner.Suspense>
        ),
    },
    {
        path: "/glossaries/*",
        element: (
            <Spinner.Suspense>
                <Glossaries />
            </Spinner.Suspense>
        ),
    },
    {
        path: "/email-unsubscribe",
        element: (
            <Spinner.Suspense>
                <EmailUnsubscribe />
            </Spinner.Suspense>
        ),
    },
    {
        path: "*",
        element: <UnknownPage />,
    },
];

export default AppRoutes;
