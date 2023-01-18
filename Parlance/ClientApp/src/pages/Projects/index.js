import {Route, Routes} from "react-router-dom";
import ProjectListing from "./ProjectListing";
import Subprojects from "./Subprojects";
import Languages from "./Languages";

export default function(props) {
    return <Routes>
        <Route element={<ProjectListing />} path={"/"} />
        <Route element={<Languages />} path={"/languages/*"} />
        <Route element={<Subprojects />} path={"/:project/*"} />
    </Routes>
}