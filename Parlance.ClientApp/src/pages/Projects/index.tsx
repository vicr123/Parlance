import { Route, Routes } from "react-router-dom";
import ProjectListing from "./ProjectListing";
import Subprojects from "./Subprojects/index";

export default function () {
    return (
        <Routes>
            <Route element={<ProjectListing />} path={"/"} />
            <Route element={<Subprojects />} path={"/:project/*"} />
        </Routes>
    );
}
