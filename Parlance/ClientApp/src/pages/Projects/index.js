import {Route, Routes} from "react-router-dom";
import ProjectListing from "./ProjectListing";

export default function(props) {
    return <Routes>
        <Route element={<ProjectListing />} path={"/"} />
    </Routes>
}