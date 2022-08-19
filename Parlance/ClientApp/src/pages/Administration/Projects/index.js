import ProjectListing from "./ProjectListing";
import {Route, Routes} from "react-router-dom";
import AddProject from "./AddProject";

export default function(props) {
    return <Routes>
        <Route element={<AddProject />} path={"/add"} />
        <Route element={<ProjectListing />} path={"/"} />
    </Routes>
}