import {Route, Routes} from "react-router-dom";
import SubprojectListing from "./SubprojectListing";
import Languages from "./Languages";
import VersionControl from "./VersionControl";

export default function (props) {
    return <Routes>
        <Route element={<SubprojectListing/>} path={"/"}/>
        <Route element={<VersionControl/>} path={"/vcs/*"}/>
        <Route element={<Languages/>} path={"/:subproject/*"}/>
    </Routes>
}