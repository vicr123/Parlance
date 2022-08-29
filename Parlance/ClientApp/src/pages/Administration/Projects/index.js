import ProjectListing from "./ProjectListing";
import {Route, Routes} from "react-router-dom";
import AddProject from "./AddProject";
import Project from "./Project";

export default function(props) {
    return <Routes>
        <Route element={<AddProject />} path={"/add"} />
        <Route element={<ProjectListing />} path={"/"} />
        <Route element={<Project />} path={"/:project"} />
    </Routes>
}