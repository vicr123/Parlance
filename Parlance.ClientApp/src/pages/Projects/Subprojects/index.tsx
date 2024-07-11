import { Route, Routes } from "react-router-dom";
import SubprojectListing from "./SubprojectListing";
import Languages from "./Languages/index";
import VersionControl from "./VersionControl/index";
import Glossaries from "./Glossaries";

export default function () {
    return (
        <Routes>
            <Route element={<SubprojectListing />} path={"/"} />
            <Route element={<VersionControl />} path={"/vcs/*"} />
            <Route element={<Glossaries />} path={"/glossaries/*"} />
            <Route element={<Languages />} path={"/:subproject/*"} />
        </Routes>
    );
}
